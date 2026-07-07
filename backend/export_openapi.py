import sys
from unittest.mock import MagicMock

# Mock out heavy ML modules that try to download things on import
sys.modules['sentence_transformers'] = MagicMock()
sys.modules['prophet'] = MagicMock()
sys.modules['faiss'] = MagicMock()

import json
from app.main import app
from app.config import settings
settings.redis_url = None

openapi_schema = app.openapi()
with open("../docs/openapi.json", "w") as f:
    json.dump(openapi_schema, f, indent=2)
print("OpenAPI schema exported successfully.")
