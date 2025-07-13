import { Product } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// El entorno de ejecución de la aplicación proporciona la clave de API a través de `process.env.API_KEY`.
// Se asume que esta variable está preconfigurada y disponible.
const apiKey = process.env.API_KEY;

export let GEMINI_API_KEY_ERROR: string | null = null;
let ai: GoogleGenAI | null = null;

// Validar que la clave de API exista
if (!apiKey) {
  // En lugar de arrojar un error que bloquea la app, guardamos el mensaje.
  // La UI mostrará este error al usuario de forma amigable.
  GEMINI_API_KEY_ERROR = "API_KEY no está definida. Por favor, configura la variable de entorno en tu plataforma de despliegue (ej. Netlify).";
  console.error(GEMINI_API_KEY_ERROR);
} else {
    // Initialize the Google GenAI client only if the key exists
    ai = new GoogleGenAI({ apiKey });
}

/**
 * Calls the Gemini API to generate a product description.
 * @param productName The name of the product.
 * @param category The product's category.
 * @returns A promise that resolves to a description string.
 */
export const generateDescriptionWithAI = async (productName: string, category: string): Promise<string> => {
  if (!ai) {
      return "Error: El cliente de IA no está inicializado. Revisa la configuración de la API Key.";
  }
  console.log(`AI: Generating description for "${productName}" in category "${category}"...`);
  
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Genera una descripción de producto atractiva y vendedora para: "${productName}". Es de la categoría "${category}". Enfócate en la calidad de los materiales, el estilo y cómo hace sentir a la persona que lo usa. Máximo 80 palabras. La descripción debe ser cálida, elegante y persuasiva.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("AI description generation error:", error);
    return "Error al generar la descripción. Por favor, inténtalo de nuevo o escribe una manualmente.";
  }
};

/**
 * Calls the Gemini API to recommend products.
 * @param currentProduct The product for which to get recommendations.
 * @param allProducts A list of all available products to choose from.
 * @returns A promise that resolves to an array of recommended product names.
 */
export const recommendLookWithAI = async (currentProduct: Product, allProducts: Product[]): Promise<string[]> => {
  if (!ai) {
      console.error("AI client not initialized. Check API Key configuration.");
      return [];
  }
  console.log(`AI: Generating look for ${currentProduct.name}...`);

  try {
    const model = 'gemini-2.5-flash';
    const availableProductNames = allProducts.filter(p => p.id !== currentProduct.id && p.available).map(p => p.name);
    
    if (availableProductNames.length < 2) {
      console.log("Not enough available products to make a recommendation.");
      return []; 
    }
    
    const prompt = `Soy un estilista de moda. Un cliente está viendo el producto "${currentProduct.name}" que es un(a) ${currentProduct.category}. Para "completar el look", recomiéndale exactamente DOS productos de la siguiente lista de productos disponibles: ${JSON.stringify(availableProductNames)}. Responde únicamente con un array JSON que contenga los dos nombres de los productos recomendados. Tu respuesta DEBE ser solo el array JSON, sin texto adicional ni markdown. Ejemplo de respuesta: ["Nombre Producto 1", "Nombre Producto 2"]`;
    
    const response = await ai.models.generateContent({ 
        model, 
        contents: prompt, 
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        } 
    });
    
    const responseText = response.text.trim();
    const recommendedNames = JSON.parse(responseText);
    return Array.isArray(recommendedNames) ? recommendedNames : [];
  } catch (e) {
    console.error("AI Error: Could not parse recommendation response", e);
    return [];
  }
};