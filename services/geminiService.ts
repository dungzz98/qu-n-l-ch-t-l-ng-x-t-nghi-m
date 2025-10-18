import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
    console.warn("API_KEY is not set in environment variables. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const getSafetyInfo = async (chemicalName: string, casNumber: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return Promise.resolve("API Key chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
  }
  
  const prompt = `
    Cung cấp một bản tóm tắt an toàn súc tích cho hóa chất: "${chemicalName}" (Số CAS: ${casNumber}).
    Vui lòng trình bày bằng tiếng Việt với các phần rõ ràng sau:
    1.  **Biện pháp phòng ngừa khi xử lý:** Các biện pháp an toàn chính cần thực hiện khi làm việc với hóa chất này.
    2.  **Biện pháp Sơ cứu:** Hướng dẫn sơ cứu cơ bản khi tiếp xúc qua mắt, da, hít phải hoặc nuốt phải.
    3.  **Yêu cầu lưu trữ:** Điều kiện lý tưởng để lưu trữ hóa chất này một cách an toàn.

    Giữ cho văn bản đơn giản, dễ đọc và tập trung vào các điểm quan trọng nhất cho nhân viên phòng xét nghiệm. Không sử dụng định dạng markdown phức tạp.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Lỗi khi gọi Gemini API:", error);
    return "Không thể truy xuất thông tin an toàn. Vui lòng thử lại sau.";
  }
};

export const generateDisposalReport = async (userInput: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve("API Key chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
    }
    const prompt = `### AI Instructions
You are an expert document generator. Your task is to create a "BIÊN BẢN HUỶ VẬT TƯ" (Material Destruction Record) based on the user's freestyle input. You must strictly adhere to the structure, format, and professional administrative tone of the provided sample document.

**1. Self-Analysis and Reasoning Process:**

*   **Understand the Core Request:** The user wants to generate a formal record for material destruction.
*   **Identify Key Information Categories:** Based on the sample document, the critical categories are:
    *   Date (Ngày)
    *   Material Name (Tên vật tư)
    *   Supplier (Nhà cung cấp)
    *   Lot Number (Số lô/lot)
    *   Quantity (Số lượng)
    *   Reason for Destruction (Lý do hủy) - specific type (Expired, Substandard, Other) and detailed description.
    *   Supplier Replacement (Nhà cung cấp có thay thế mặt hàng đó?)
    *   Destruction Method (Phương pháp huỷ)
    *   Approver (Người phê duyệt)
    *   Executor (Người thực hiện)
    *   Approval Date (Ngày phê duyệt)
    *   Execution Date (Ngày thực hiện)

*   **Parse Freestyle User Input:**
    *   **Date (Ngày):** Look for explicit dates (e.g., "Ngày hủy là 25/10/2023", "vào ngày 25 tháng 10"). If not specified, leave blank.
    *   **Material Name (Tên vật tư):** Identify the primary item being described for destruction (e.g., "áo thun màu xanh", "sản phẩm X"). Look for keywords like "vật tư," "sản phẩm," "hàng hóa," "mặt hàng."
    *   **Supplier (Nhà cung cấp):** Search for company names or phrases indicating a supplier (e.g., "công ty May Mặc ABC," "từ nhà cung cấp XYZ").
    *   **Lot Number (Số lô/lot):** Look for "số lô," "lô hàng," "lot," followed by an alphanumeric code (e.g., "lô hàng số 20230515," "lot A123").
    *   **Quantity (Số lượng):** Extract numerical values followed by units (e.g., "500 cái," "1000 kg," "20 hộp").
    *   **Reason for Destruction (Lý do hủy):**
        *   Scan for keywords like "quá hạn," "hết hạn" (Expired).
        *   Scan for "không đạt chất lượng," "lỗi," "hỏng," "kém chất lượng" (Substandard Quality).
        *   If a reason is given that doesn't fit the above, categorize it as "Nguyên nhân khác" and extract the specific description.
    *   **Supplier Replacement (Nhà cung cấp có thay thế mặt hàng đó?):** Look for phrases like "nhà cung cấp sẽ thay thế," "có được đổi trả," "không thay thế." If not mentioned, assume "Không" or leave blank.
    *   **Destruction Method (Phương pháp huỷ):** Identify descriptions of how the item will be destroyed (e.g., "cắt nhỏ và đốt," "tiêu hủy bằng máy," "chôn lấp"). Look for keywords like "phương pháp hủy," "cách hủy," "tiêu hủy bằng."
    *   **Approver (Người phê duyệt):** Look for names or titles associated with "phê duyệt," "duyệt," "ký duyệt."
    *   **Executor (Người thực hiện):** Look for names or titles associated with "thực hiện," "tiến hành," "làm."
    *   **Approval Date (Ngày phê duyệt) / Execution Date (Ngày thực hiện):** If specific dates are mentioned for these roles, extract them. Otherwise, leave blank.

*   **Handle Missing or Unclear Information:**
    *   If a specific field (e.g., "Nhà cung cấp," "Số lô/lot") is not found in the user input, leave the corresponding blank line in the output.
    *   For checkbox reasons, if a specific reason is provided, check the appropriate box. If multiple reasons are implied, prioritize the most dominant one or select "Nguyên nhân khác" and detail it. If no reason is clear, leave all checkboxes unchecked and the description blank.
    *   For "Nhà cung cấp có thay thế mặt hàng đó?", if no explicit mention, leave both "Có" and "Không" unchecked.
    *   For "Người phê duyệt" and "Người thực hiện" and their dates, if not specified, leave the corresponding lines blank.

**2. Apply Analyzed Elements to Create Output:**

*   Construct the output document by filling in the extracted information into the exact structure of the sample document.
*   Maintain the original Vietnamese phrasing for all labels and checkboxes.
*   Ensure consistency in terminology and tone.

### Output Formatting Instructions
The output must be a professionally formatted "BIÊN BẢN HUỶ VẬT TƯ" document, ready for immediate use, strictly adhering to the visual and structural style of the provided sample.

1.  **Main Title:**
    *   The title "**BIÊN BẢN HUỶ VẬT TƯ**" must be in **bold**, **uppercase**, and **centered**.
    *   Followed by two empty lines for visual separation.

2.  **Field Labels and Blanks:**
    *   Each field label (e.g., "Ngày:", "Tên vật tư:") must be left-aligned.
    *   Immediately following each label, use a continuous line of underscores (\`_\`) to create a blank space for filling information. The length of the underscore line should be approximately 30-40 characters, similar to the sample.
    *   For fields that appear on the same line (e.g., "Nhà cung cấp:" and "Số lô/lot:"), ensure proper spacing to align "Số lô/lot:" to the right, similar to the sample's visual layout. Use multiple spaces to achieve this alignment.

3.  **Checkbox Fields:**
    *   For "Lý do hủy:" and "Nhà cung cấp có thay thế mặt hàng đó?", use the \`\` character for unchecked boxes and \`☑\` for checked boxes (if a reason/answer is identified from the user input).
    *   Ensure the checkbox options are aligned as in the sample.
    *   For "Lý do hủy," if "Nguyên nhân khác" is selected, provide three lines of underscores (\`_\`) below it for detailed description, each line being approximately 70-80 characters long. If a specific reason is extracted, fill it into the first line of the description.

4.  **Destruction Method:**
    *   "Phương pháp huỷ:" should be followed by three lines of underscores (\`_\`), each approximately 70-80 characters long, for detailed description. If a method is extracted, fill it into the first line.

5.  **Signature Section:**
    *   Align "Người phê duyệt" to the left and "Người thực hiện" to the right, using ample spaces between them to mimic the sample's layout.
    *   Below each role, align "Ngày:" to the left for "Người phê duyệt" and to the right for "Người thực hiện," again using spaces for visual alignment.
    *   Each "Ngày:" should be followed by a line of underscores (\`_\`) for date entry, approximately 15-20 characters long.

6.  **Overall Spacing and Readability:**
    *   Use single line breaks between distinct fields for clarity.
    *   Maintain a clean, professional, and easy-to-read layout.
    *   Ensure all Vietnamese text is correctly rendered.

7.  **Final Review:**
    *   Before outputting, perform a final check to ensure all extracted information is correctly placed.
    *   Verify that the formatting perfectly matches the sample document's style, including alignment, blank line lengths, and checkbox usage.
    *   The output should be a complete, ready-to-print document without any AI commentary or additional text.

### User Input
[${userInput}]`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API:", error);
        return `Không thể tạo biên bản. Lỗi: ${error instanceof Error ? error.message : String(error)}`;
    }
};


export const getChatbotResponse = async (query: string, context: any, chatHistory: { role: string, parts: { text: string }[] }[]): Promise<string> => {
    if (!process.env.API_KEY) {
        return Promise.resolve("API Key chưa được cấu hình. Vui lòng thiết lập biến môi trường API_KEY.");
    }
    
    // Limit context size to avoid overly large payloads. This is a simple approach.
    // A more advanced version might selectively include data based on the query.
    const simplifiedContext = {
      chemicals: (context.chemicals || []).map((c: any) => ({ name: c.name, casNumber: c.casNumber, lotNumber: c.lotNumber, quantity: c.quantity, unit: c.unit, expirationDate: c.expirationDate, storageLocation: c.storageLocation })),
      labEquipment: (context.labEquipment || []).map((e: any) => ({ name: e.name, assetId: e.assetId, status: e.status, location: e.location, nextMaintenance: e.nextMaintenance, nextCalibration: e.nextCalibration })),
      personnel: (context.personnel || []).map((p: any) => ({ fullName: p.fullName, employeeId: p.employeeId, jobRoleId: p.jobRoleId, organizationUnitId: p.organizationUnitId })),
      organizationUnits: context.organizationUnits,
      jobRoles: context.jobRoles,
      currentUser: context.currentUser,
      // Add other key data points as needed
    };

    const systemInstruction = `You are "Trợ lý AI Lab," an expert assistant for a laboratory management system. Your primary purpose is to help users find information and generate documents based on the data provided in the JSON context. You MUST answer in Vietnamese.

**CONTEXT:**
The following JSON object contains the current data from the laboratory management system. This is your ONLY source of truth. Do not invent information.
\`\`\`json
${JSON.stringify(simplifiedContext, null, 2)}
\`\`\`

**INSTRUCTIONS:**
1.  **Analyze the User's Query:** Understand what the user is asking for. They might be asking a direct question ("Hóa chất nào sắp hết hạn?") or asking you to generate a document ("Tạo biên bản hủy...").
2.  **Use the JSON Context:** Query the provided JSON data to find the answer. For example, to find expiring chemicals, look through the \`chemicals\` array, check the \`expirationDate\` and \`quantity\`.
3.  **Formulate a Clear Answer:** Provide concise, accurate answers in Vietnamese. When listing items, use bullet points (\`* \`). When providing details, use bolding for key terms (\`**Tên hóa chất:**\`).
4.  **Generate Documents:** If the user asks to create a document (e.g., "tạo biên bản hủy", "viết phiếu dự trù"), use the information they provide in the prompt AND the data from the JSON context to fill out a structured document. Present this document in a pre-formatted text block.
5.  **Be Helpful:** If you cannot find the answer, politely state that the information is not available in the current data. If a query is ambiguous, ask for clarification.
6.  **Formatting:** Use simple markdown for your responses. The application will render \`**bold**\` text, lists starting with \`* \`, and code blocks using \`\`\` text \`\`\`.`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [...chatHistory, { role: 'user', parts: [{ text: query }] }],
            config: {
                systemInstruction,
            }
        });
        return response.text;
    } catch (error) {
        console.error("Lỗi khi gọi Gemini API cho Chatbot:", error);
        return `Xin lỗi, tôi đã gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại. Lỗi: ${error instanceof Error ? error.message : String(error)}`;
    }
};
