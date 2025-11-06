
CREATE TABLE enterprises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enterprise_companies (
  enterprise_id UUID NOT NULL REFERENCES enterprises(id) ON DELETE CASCADE,
  company_id TEXT NOT NULL,
  PRIMARY KEY (enterprise_id, company_id)
);
