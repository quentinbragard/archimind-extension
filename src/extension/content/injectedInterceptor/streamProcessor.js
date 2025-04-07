// src/extension/content/injectedInterceptor/streamProcessor.js
// Functions for processing streaming responses

import { EVENTS } from './constants';
import { dispatchEvent } from './eventsHandler';

/**
 * Process streaming data from ChatGPT and organize into thinking steps
 * @param {Object} data - The data chunk received from the stream
 * @param {Object} assistantData - Current accumulated assistant response data
 * @param {Array} thinkingSteps - Array of thinking steps
 * @returns {Object} Updated assistantData and thinkingSteps
 */
export function processStreamData(data, assistantData, thinkingSteps) {
  // Initialize assistantData if needed
  if (!assistantData) {
    assistantData = {
      messageId: null,
      conversationId: null,
      model: null,
      content: '',
      isComplete: false,
      currentThinkingStep: null,
      createTime: null,        // For timestamp
      parentMessageId: null    // For parent message tracking
    };
  }
  
  // Initialize thinkingSteps if needed
  if (!thinkingSteps) {
    thinkingSteps = [];
  }

  // Handle message stream complete marker
  if (data.type === "message_stream_complete") {
    assistantData.isComplete = true;
    assistantData.conversationId = data.conversation_id || assistantData.conversationId;
    return { assistantData, thinkingSteps };
  }
  
  // Handle initial message creation with 'add' operation
  if (data.o === "add" && data.v?.message) {
    // Extract message metadata
    assistantData.messageId = data.v.message.id;
    assistantData.conversationId = data.v.conversation_id;
    assistantData.model = data.v.message.metadata?.model_slug || null;
    
    // Extract create_time if available
    if (data.v.message.create_time) {
      assistantData.createTime = data.v.message.create_time;
    }
    
    // Extract parent_message_provider_id if available in metadata
    if (data.v.message.metadata?.parent_id) {
      assistantData.parentMessageId = data.v.message.metadata.parent_id;
    }
    
    // Check if this is a thinking step (tool) or the final answer (assistant)
    const role = data.v.message.author?.role;
    
    // Create a new thinking step entry
    const newStep = {
      id: data.v.message.id,
      role: role,
      content: '',
      createTime: data.v.message.create_time,
      parentMessageId: data.v.message.metadata?.parent_id,
      initialText: data.v.message.metadata?.initial_text || '',
      finishedText: data.v.message.metadata?.finished_text || ''
    };
    
    thinkingSteps.push(newStep);
    assistantData.currentThinkingStep = thinkingSteps.length - 1;
    
    // If this is the assistant's final message, set it as the main content
    if (role === 'assistant') {
      assistantData.content = '';
    }
    
    return { assistantData, thinkingSteps };
  }
  
  // Handle content append operations
  if (data.o === "append" && data.p === "/message/content/parts/0" && data.v) {
    // If we have a current thinking step, append to it
    if (assistantData.currentThinkingStep !== null && assistantData.currentThinkingStep < thinkingSteps.length) {
      thinkingSteps[assistantData.currentThinkingStep].content += data.v;
      
      // If this is the assistant's message, also update the main content
      if (thinkingSteps[assistantData.currentThinkingStep].role === 'assistant') {
        assistantData.content += data.v;
      }
    }
    return { assistantData, thinkingSteps };
  }
  
  // Handle string content with no operation
  if (typeof data.v === "string" && !data.o) {
    // If we have a current thinking step, append to it
    if (assistantData.currentThinkingStep !== null && assistantData.currentThinkingStep < thinkingSteps.length) {
      thinkingSteps[assistantData.currentThinkingStep].content += data.v;
      
      // If this is the assistant's message, also update the main content
      if (thinkingSteps[assistantData.currentThinkingStep].role === 'assistant') {
        assistantData.content += data.v;
      }
    }
    return { assistantData, thinkingSteps };
  }
  
  // Handle patch operations
  if (data.o === "patch" && Array.isArray(data.v)) {
    for (const patch of data.v) {
      // Check for status changes
      if (patch.p === "/message/status" && patch.v === "finished_successfully") {
        // The current thinking step is complete, but the overall message may not be
      }
      
      // Check for metadata changes
      if (patch.p === "/message/metadata/finished_text" && assistantData.currentThinkingStep !== null) {
        // Update the finished text for the current thinking step
        thinkingSteps[assistantData.currentThinkingStep].finishedText = patch.v;
      }
      
      // Check for content append in a patch
      if (patch.p === "/message/content/parts/0" && patch.o === "append" && patch.v) {
        if (assistantData.currentThinkingStep !== null && assistantData.currentThinkingStep < thinkingSteps.length) {
          thinkingSteps[assistantData.currentThinkingStep].content += patch.v;
          
          // If this is the assistant's message, also update the main content
          if (thinkingSteps[assistantData.currentThinkingStep].role === 'assistant') {
            assistantData.content += patch.v;
          }
        }
      }
    }
    return { assistantData, thinkingSteps };
  }
  
  // Return current state unchanged for any unhandled data format
  return { assistantData, thinkingSteps };
}

/**
 * Process streaming responses from ChatGPT
 * @param {Response} response - The fetch response
 * @param {Object} requestBody - The original request body
 * @returns {Promise<void>}
 */
export async function processStreamingResponse(response, requestBody) {
  console.log("PROCESSING STREAMING RESPONSE");
  const clonedResponse = response.clone();
  const reader = clonedResponse.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  // Data for current assistant response
  let assistantData = {
    messageId: null,
    conversationId: null,
    model: null,
    content: '',
    isComplete: false,
    createTime: null,
    parentMessageId: null
  };
  
  // Array to track thinking steps
  let thinkingSteps = [];
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete events
      let eventEndIndex;
      while ((eventEndIndex = buffer.indexOf('\n\n')) !== -1) {
        const eventString = buffer.substring(0, eventEndIndex + 2);
        buffer = buffer.substring(eventEndIndex + 2);
        
        // Parse event
        const eventMatch = eventString.match(/^event: ([^\n]+)/);
        const dataMatch = eventString.match(/data: (.+)$/m);
        
        if (!dataMatch) continue;
        
        const eventType = eventMatch ? eventMatch[1] : 'unknown';

        // Handle special "[DONE]" message 
        if (dataMatch[1] === '[DONE]') {
          console.log("Received [DONE] message, finalizing response");
          if (assistantData.messageId && assistantData.content.length > 0) {
            assistantData.isComplete = true;
            dispatchEvent(EVENTS.ASSISTANT_RESPONSE, assistantData);
          }
          continue; // Skip JSON parsing for this message
        }
        
        // Parse JSON data (only for non-[DONE] messages)
        try {
          const data = JSON.parse(dataMatch[1]);
          
          // Process message stream complete event
          if (data.type === "message_stream_complete") {
            if (assistantData.messageId) {
              assistantData.isComplete = true;
              console.log("Stream processing complete");
              dispatchEvent(EVENTS.ASSISTANT_RESPONSE, assistantData);
            }
            continue;
          }
          
          // Process the data using our specialized function
          const result = processStreamData(data, assistantData, thinkingSteps);
          assistantData = result.assistantData;
          thinkingSteps = result.thinkingSteps;
          
          // If the assistant is the final answer and we've accumulated significant content,
          // send periodic updates for long responses
          if (assistantData.messageId && 
              assistantData.content.length > 0 && 
              assistantData.content.length % 500 === 0) {
            // Send interim update with isComplete=false
            dispatchEvent(EVENTS.ASSISTANT_RESPONSE, {
              ...assistantData,
              isComplete: false
            });
          }
        } catch (error) {
          console.error('Error parsing data:', error, 'Raw data:', dataMatch[1]);
        }
      }
    }
    
    // Final check: If we have message content but never got a completion signal,
    // send what we have with isComplete=true
    if (assistantData.messageId && assistantData.content.length > 0 && !assistantData.isComplete) {
      console.log("Stream ended without completion signal, sending final data");
      assistantData.isComplete = true;
      dispatchEvent(EVENTS.ASSISTANT_RESPONSE, assistantData);
    }
  } catch (error) {
    console.error('Error processing stream:', error);
    
    // Try to salvage partial response in case of errors
    if (assistantData.messageId && assistantData.content.length > 0) {
      console.log("Salvaging partial response after error");
      assistantData.isComplete = true;
      dispatchEvent(EVENTS.ASSISTANT_RESPONSE, assistantData);
    }
  }
}