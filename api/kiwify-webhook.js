import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const body = req.body;

    const email =
      body?.data?.customer?.email ||
      body?.Customer?.email ||
      body?.customer?.email ||
      body?.email;

    const nome =
      body?.data?.customer?.full_name ||
      body?.data?.customer?.name ||
      body?.Customer?.full_name ||
      body?.customer?.name ||
      body?.name ||
      '';

    if (!email) return res.status(400).json({ error: 'Email não encontrado' });

    const { error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: nome }
    });

    if (createError && !createError.message.includes('already registered')) {
      return res.status(500).json({ error: createError.message });
    }

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://consorcio-calc-pro.vercel.app/app.html'
    });

    return res.status(200).json({ success: true, email });

  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
}
