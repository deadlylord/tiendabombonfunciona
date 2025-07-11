import { Product } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

// El entorno de ejecución de la aplicación proporciona la clave de API a través de `process.env.API_KEY`.
// Se asume que esta variable está preconfigurada y disponible.
// @ts-ignore
const apiKey = process.env.API_KEY;


// Validar que la clave de API exista
if (!apiKey) {
  // Arrojar un error claro si la clave no está configurada.
  // Esto detiene la ejecución y previene errores inesperados más adelante.
  // Asegúrate de haber configurado la variable de entorno API_KEY
  // en tu entorno de despliegue (ej. en Netlify).
  throw new Error("API_KEY no está definida. Por favor, configura la variable de entorno.");
}

// Initialize the Google GenAI client
const ai = new GoogleGenAI({ apiKey });
/**
 * Calls the Gemini API to generate a product description.
 * @param productName The name of the product.
 * @param category The product's category.
 * @returns A promise that resolves to a description string.
 */
export const generateDescriptionWithAI = async (productName: string, category: string): Promise<string> => {
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