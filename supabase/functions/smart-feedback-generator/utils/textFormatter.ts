
export function cleanMarkdownFormatting(text: string): string {
  // Remove markdown bold formatting
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  
  // Remove markdown headers
  text = text.replace(/#{1,6}\s+/g, '');
  
  // Clean up any remaining markdown symbols
  text = text.replace(/`(.*?)`/g, '$1');
  text = text.replace(/_{1,2}(.*?)_{1,2}/g, '$1');
  
  // Clean up excessive whitespace
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.replace(/[ ]{2,}/g, ' ');
  
  return text;
}
