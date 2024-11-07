# backend/server.py

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import logging
from deep_translator import GoogleTranslator

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text')
        target_lang = data.get('target_lang')
        source_lang = data.get('source_lang', 'auto')

        if not text or not target_lang:
            logger.error("Missing 'text' or 'target_lang' parameter.")
            return jsonify({"error": "Missing required parameters"}), 400

        logger.info(f"Translating text: '{text}' from '{source_lang}' to '{target_lang}'")
        
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translated_text = translator.translate(text)

        return jsonify({"translatedText": translated_text})

    except Exception as e:
        logger.exception("Exception during translation.")
        return jsonify({"error": str(e)}), 500

@app.route('/api/languages', methods=['GET'])
def get_languages():
    try:
        # Get supported languages as dictionary
        languages_dict = GoogleTranslator().get_supported_languages(as_dict=True)
        
        # Convert to list of dictionaries format
        languages_list = [
            {"code": code, "name": name} 
            for name, code in languages_dict.items()
        ]
        
        # Sort languages by name
        languages_list.sort(key=lambda x: x['name'])
        
        logger.info(f"Fetched {len(languages_list)} languages")
        return jsonify(languages_list)

    except Exception as e:
        logger.exception("Exception while fetching languages.")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)