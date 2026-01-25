-- Limpiar políticas conflictivas y crear una única política para service_catalog

-- Eliminar las políticas antiguas
DROP POLICY IF EXISTS "Service catalog manageable by org members" ON service_catalog;
DROP POLICY IF EXISTS "Service catalog viewable by org members" ON service_catalog;
DROP POLICY IF EXISTS "Users can view org services and preconfigured services" ON service_catalog;

-- Crear una única política para SELECT que permite ver:
-- 1. Servicios de tu organización
-- 2. Servicios preconfigurados (organization_id IS NULL)
CREATE POLICY "Users can view their org services and preconfigured catalog"
  ON service_catalog
  FOR SELECT
  USING (
    -- Servicios de mi organización
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
    OR 
    -- Servicios preconfigurados del catálogo global
    organization_id IS NULL
  );

-- Política para INSERT: solo en tu organización
CREATE POLICY "Users can create services in their org"
  ON service_catalog
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Política para UPDATE: solo servicios de tu organización
CREATE POLICY "Users can update their org services"
  ON service_catalog
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

-- Política para DELETE: solo servicios de tu organización
CREATE POLICY "Users can delete their org services"
  ON service_catalog
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM memberships 
      WHERE user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Users can view their org services and preconfigured catalog" ON service_catalog IS
'Allows users to view:
- Services belonging to their organization
- System preconfigured services (organization_id IS NULL) for activation';