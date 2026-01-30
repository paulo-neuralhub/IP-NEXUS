-- Fix template_content to match content_html for all system templates
UPDATE document_templates
SET template_content = content_html
WHERE is_system_template = true 
  AND organization_id IS NULL
  AND content_html IS NOT NULL
  AND content_html != template_content;