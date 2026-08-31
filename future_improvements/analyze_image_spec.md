# analyze_image Tool — Vision Model Integration Spec

**Status:** Draft (v1.9.8+)  
**Date:** 2026-08-17  
**Priority:** 🟡 Medium (~2-3 hours)

---

## 1. Problem Statement

The ai_toolbox plugin currently has:
- ✅ **OCR-based text extraction**: `image_to_text` (Tesseract.js, local processing)
- ✅ **Metadata inspection**: `describe_image` (file size, dimensions, format)
- ✅ **Pixel comparison**: `compare_images` (byte-level diff)

**Missing:** Vision-model-based image analysis — the ability to send an image to a loaded LLM with vision capabilities and get contextual understanding, reasoning, or description from the model itself.

This gap was identified by comparing our plugin against danielsig/duckduckgo rev8 on LM Studio Hub, which added a 3rd tool for image analysis via the vision model.

---

## 2. Architecture Overview

### 2.1 Why This Is Different From `image_to_text`

| Aspect | `image_to_text` (OCR) | `analyze_image` (Vision Model) |
|--------|----------------------|-------------------------------|
| Engine | Tesseract.js (local, CPU-bound) | LM Studio loaded LLM (GPU-accelerated if available) |
| Output | Raw text extraction from pixels | Contextual understanding, reasoning, description |
| Use case | "Extract this receipt's total" | "What is happening in this photo?" / "Describe the UI layout" |
| Model dependency | None | Requires vision-capable model loaded (e.g., Llama 3.2 Vision, Moondream) |

### 2.2 SDK Integration Points (from `@lmstudio/sdk` v1.x types)

```typescript
// 1. Check if a loaded model supports vision
const model = await client.llm.model("my-vision-model");
model.vision; // boolean — true if image input supported

// 2. Prepare an image for the SDK
const fileHandle = await client.files.prepareImage("/path/to/image.png");
fileHandle.isImage(); // true

// 3. Attach images to chat messages
chat.append("user", "Analyze this image", { images: [fileHandle] });
// OR via ChatMessageInput:
{ role: "user", content: "Describe this", images: [fileHandle] }

// 4. Get prediction result from vision model
const result = await model.respond(chat);
result.content; // The model's textual analysis
```

### 2.3 Plugin Tool Constraint

**Critical constraint:** Tools registered via `toolsProvider` run as standalone function calls and do NOT have direct access to:
- `LMStudioClient` instance
- Loaded models (`client.llm.model()`)
- Chat history context

This means a pure tool implementation cannot directly invoke vision model predictions. There are **two viable approaches**:

---

## 3. Implementation Approaches

### Approach A: Hybrid Tool + SDK Bridge (Recommended) ⭐

**Concept:** The `analyze_image` tool acts as a pre-flight validator that prepares the image and returns structured metadata, then instructs the LLM to perform the actual vision analysis using its built-in capabilities.

```typescript
// In src/tools/imageAnalysisTools.ts
async function analyzeImage({ imagePath, prompt }: AnalyzeImageParams): Promise<unknown> {
  const validation = validateImageFile(imagePath);
  if (!validation.valid) return { success: false, error: validation.error };
  
  // Return structured response that guides the LLM
  return {
    success: true,
    data: {
      imagePath: imagePath,
      resolvedPath: validation.resolvedPath,
      metadata: { size, format, mimeType },
      prompt: userPrompt || "Describe this image in detail",
      
      // KEY: This instruction tells the LLM to use its vision capabilities
      _lmstudio_instruction: `The image at ${validation.resolvedPath} has been validated. 
        Please analyze it using your loaded vision model with the following prompt: "${userPrompt}"`
    }
  };
}
```

**Pros:**
- Works within current tool architecture (no SDK access needed)
- LLM naturally handles image attachments in chat context
- Minimal code changes

**Cons:**
- Requires user to manually upload/attach the image first
- Tool cannot directly invoke vision model prediction

### Approach B: Generator Plugin Component (Full Integration)

**Concept:** Implement `analyze_image` as a generator plugin component that has access to `ProcessingController.tokenSource()` and can directly call vision models.

```typescript
// This would go in src/generator/analyzeImageGenerator.ts
import type { Generator } from '@lmstudio/sdk';

export const analyzeImageGenerator: Generator = async (ctl, history) => {
  // Access the loaded model via ProcessingController
  const tokenSource = await ctl.tokenSource();
  
  if ('respond' in tokenSource) {
    // It's an LLM — check if it supports vision
    const modelInfo = await tokenSource.getModelInfo();
    if (!modelInfo.vision) {
      // Tell the user a vision model is required
      return;
    }
    
    // Get image attachments from chat history
    const files = history.getAllFiles(client);
    const imageFiles = files.filter(f => f.isImage());
    
    if (imageFiles.length === 0) {
      // No images to analyze
      return;
    }
    
    // Prepare images for vision model
    const fileHandles = await Promise.all(
      imageFiles.map(async (f) => ({
        path: await f.getFilePath(),
        name: f.name,
      }))
    );
    
    // Build chat with images attached
    const chatWithImages = Chat.from(history);
    for (const fh of fileHandles) {
      const handle = await client.files.prepareImage(fh.path);
      chatWithImages.append("user", "Analyze this image", { images: [handle] });
    }
    
    // Generate vision analysis
    const prediction = tokenSource.respond(chatWithImages);
    for await (const fragment of prediction) {
      ctl.fragmentGenerated(fragment.content, { tokensCount: fragment.tokensCount });
    }
  }
};
```

**Pros:**
- Full SDK integration — direct vision model access
- Automatic image attachment handling
- Seamless LLM interaction

**Cons:**
- Requires generator plugin architecture (more complex)
- Needs `withGenerator()` registration in `src/index.ts`
- May conflict with existing prompt preprocessor flow

### Approach C: Prompt Preprocessor Integration

**Concept:** Extend the prompt preprocessor to detect image attachments and automatically route them through a vision analysis pipeline before passing to the main model.

```typescript
// In src/promptPreprocessor.ts — add step for vision analysis
export async function preprocess(ctl: PromptPreprocessorController, userMessage: ChatMessage): Promise<string | ChatMessage> {
  // ... existing preprocessor logic ...
  
  // NEW: Check if message contains images and a vision-related prompt
  const hasImages = userMessage.hasFiles();
  const isVisionQuery = detectVisionIntent(userMessage.getText());
  
  if (hasImages && isVisionQuery) {
    // Route through vision analysis pipeline
    return await routeToVisionModel(ctl, userMessage);
  }
  
  return userMessage;
}

async function detectVisionIntent(text: string): boolean {
  const visionKeywords = ['analyze', 'describe', 'what is in', 'identify', 'vision'];
  return visionKeywords.some(kw => text.toLowerCase().includes(kw));
}
```

**Pros:**
- Transparent to user — automatic detection
- No new tool registration needed
- Leverages existing infrastructure

**Cons:**
- Modifies core preprocessor pipeline (higher risk)
- May interfere with other image-related tools (`image_to_text`)

---

## 4. Recommended Implementation Plan

### Phase 1: Quick Win (Approach A — Hybrid Tool) ⏱️ ~30 min
1. ✅ Register `analyze_image` tool in `toolsProvider.ts` under a new config key `imageAnalysis`
2. ✅ Add config toggle in `config.ts`: `{ key: 'imageAnalysis', type: 'boolean', default: true }`
3. ✅ Implement pre-flight validation (file path resolution, size check, format validation)
4. ✅ Return structured metadata + guidance prompt for LLM

### Phase 2: Full SDK Integration (Approach B — Generator) ⏱️ ~2 hours
1. Create `src/generator/analyzeImageGenerator.ts` with full vision model access
2. Register generator in `src/index.ts` via `context.withGenerator()`
3. Handle image attachment lifecycle (`client.files.prepareImage()`)
4. Implement prediction streaming with `ProcessingController.fragmentGenerated()`

### Phase 3: Preprocessor Enhancement (Approach C) ⏱️ ~1 hour
1. Add vision intent detection in `promptPreprocessor.ts`
2. Route vision queries through appropriate pipeline
3. Ensure compatibility with existing `image_to_text` tool

---

## 5. Config Schema Addition

```typescript
// In config.ts — add to imageProcessing scope:
.field('imageAnalysis', 'boolean', {
  displayName: '🔍 Vision Model Analysis',
  hint: 'Enable analyze_image tool for vision-model-based image analysis.',
}, DEFAULT_CONFIG.imageAnalysis),
```

---

## 6. Testing Plan

### Unit Tests (`tests/imageAnalysisTools.test.ts`)
- [ ] `validateImageFile()` with valid paths, invalid paths, non-existent files
- [ ] `resolveImagePath()` with absolute paths, relative paths, temp directory fallbacks
- [ ] Domain exclusion list coverage (wikipedia.org, reddit.com, quora.com)

### Integration Tests
- [ ] Load vision model → verify `.vision === true`
- [ ] Prepare image file → verify `FileHandle.isImage() === true`
- [ ] Send chat with images → verify prediction returns descriptive text
- [ ] Non-vision model → verify graceful error ("This model does not support vision")

### Manual Testing
1. Load a vision-capable model (e.g., `llama-3.2-1b-instruct-vision`)
2. Attach an image to chat session
3. Call `analyze_image` with custom prompt
4. Verify LLM returns contextual analysis, not just OCR text

---

## 7. Caveats & Trade-offs

| Aspect | Consideration |
|--------|--------------|
| **Model requirement** | User must have a vision-capable model loaded. Tool should check and fail gracefully if none found. |
| **Performance** | Vision model inference is slower than OCR (~1-5 seconds vs ~0.5 seconds for Tesseract). Set appropriate timeout expectations. |
| **Context window** | Images consume significant tokens (~500-1000 per image per LM Studio convention). Monitor context usage via `contextGuard`. |
| **Security** | Image file path resolution must prevent directory traversal attacks. Already handled by `resolveImagePath()` with fs.existsSync checks. |
| **Compatibility** | OCR (`image_to_text`) and vision analysis serve different use cases — both should coexist without conflict. |

---

## 8. Related Files

| File | Role |
|------|------|
| `src/tools/imageAnalysisTools.ts` | New tool implementation (draft) |
| `src/tools/webResearchTools.ts` | ✅ Hygiene fixes applied (domain filtering, title cleaning) |
| `src/toolsProvider.ts` | Register new tools under config toggle |
| `src/config.ts` | Add `imageAnalysis` boolean toggle |
| `src/promptPreprocessor.ts` | Optional: vision intent detection (Phase 3) |
| `src/index.ts` | Optional: generator registration (Phase 2) |

---

## 9. Version Impact

This feature requires a **version bump** to v1.9.9+ per the VERSION BUMP RULE (v1.9.8+). All documentation files must be updated:
- `package.json` → version field
- `manifest.json` → version field  
- `CHANGELOG.md` → new entry at top
- `README.md`, `DOCUMENTATION.md`, `ARCHITECTURE.md`, `TOOLS_REFERENCE.md` → bulk update v1.9.X references

---

*Draft created: 2026-08-17 | Author: ai_toolbox session analysis*
