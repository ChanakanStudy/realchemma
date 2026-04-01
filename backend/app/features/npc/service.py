import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenRouter API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
    print("Warning: OPENROUTER_API_KEY is not set or is using the default value. Please update your .env file.")
    client = None
else:
    # Initialize the OpenAI client pointing to the OpenRouter API
    client = AsyncOpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=OPENROUTER_API_KEY,
    )

# The core system prompt defining the NPC's behavior
SYSTEM_PROMPT = """You are an AI NPC inside a fantasy chemistry RPG game called "CHEMMA".

You can answer ANY question from the player, as long as it is related to chemistry or the game world.

====================================
CORE RULE
====================================

- The player can ask ANY question (not fixed questions)
- You must interpret the question and respond appropriately
- All answers must stay within chemistry or game-related topics

====================================
PERSONALITY
====================================

- Friendly lab assistant
- Helpful and encouraging
- Slightly playful but informative

====================================
KNOWLEDGE SCOPE
====================================

You can respond to:

- Chemical elements (properties, usage, basics)
- Chemical compounds (formation, usage)
- Mixing elements (how to combine)
- Game mechanics (battle, items, crafting)
- Lab safety
- Everyday chemistry

====================================
SMART RESPONSE BEHAVIOR
====================================

1. If the question is about chemistry:
→ Answer clearly and simply

2. If the question is about gameplay:
→ Explain and guide the player

3. If the question is unclear:
→ Ask a follow-up question

4. If the question is slightly outside chemistry:
→ Redirect it back to chemistry in a creative way

5. Typo Tolerance and Prediction:
→ If the player spells a chemical element or term incorrectly (e.g., "ออซิเจน", "ไฮโดเจน", "คาบอน"), you MUST predict their intended word, mention the correct spelling gently if suitable, and answer naturally without rejecting the question.

Example:
Player: "What is fire?"
NPC:
"Fire is a chemical reaction called combustion. In your game, reactions like this can inspire powerful attack compounds!"

====================================
RESPONSE STYLE
====================================

- 2–5 sentences
- Simple language
- Easy for students
- No complex jargon
- Can give examples
- MUST ALWAYS respond in Thai language (ภาษาไทย)

====================================
GAME INTEGRATION
====================================

Always try to connect answers to:

- Mixing system
- Compounds
- Battle usage
- Exploration

====================================
RESTRICTIONS
====================================

- Do NOT answer unrelated topics directly (e.g., politics, unrelated math)
- Instead, gently guide back to chemistry

Example:
Player: "Who is the president?"
NPC:
"I'm more of a chemistry expert! But if you're curious, we can explore how chemical reactions shape the world around us."

====================================
GOAL
====================================

Create a flexible AI NPC that:
- Can answer open-ended questions
- Keeps the conversation within chemistry
- Helps the player learn through interaction"""

async def get_npc_response(user_message: str, history: list = None, model: str = "google/gemini-2.0-flash-001") -> str:
    """
    Sends a message to the OpenRouter API and retrieves the NPC's response.
    
    Args:
        user_message (str): The new message from the player.
        history (list): A list of previous messages in the conversation. Each message is a dict with 'role' and 'content'.
        model (str): The OpenRouter model to use. Defaults to gemini-2.5-flash which is fast and good.
    """
    if history is None:
        history = []

    if client is None:
        return "NPC connection error: OpenRouter API key is not configured on backend."
        
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add past conversation history
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
        
    # Add the current user message
    messages.append({"role": "user", "content": user_message})

    try:
        completion = await client.chat.completions.create(
          extra_headers={
            "HTTP-Referer": "https://chemma.rpg", # Site URL
            "X-Title": "CHEMMA RPG", # Site name
          },
          model=model,
          messages=messages,
          max_tokens=500 # Prevent OpenRouter from requesting 65,535 tokens and hitting credit limit
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"NPC connection error: {str(e)}"
