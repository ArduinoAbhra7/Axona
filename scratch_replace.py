import re

path = r"c:\Users\senal\OneDrive\Documents\FocusFlow\src\data\syllabusData.ts"

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

replacements = {
    "📐": "math",
    "⚛️": "physics",
    "🧪": "chemistry",
    "🧬": "biology",
    "💻": "cs",
    "📖": "english",
    "🏛️": "history",
    "🌍": "geography"
}

for emoji, name in replacements.items():
    content = content.replace(f"icon: '{emoji}'", f"icon: '{name}'")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Syllabus data emojis replaced successfully!")
