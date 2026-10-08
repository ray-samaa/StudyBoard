from supabase import create_client
from app.settings import settings

import truststore
truststore.inject_into_ssl()


supabase = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SECRET_KEY
)