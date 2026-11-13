// ── STORE DE DATOS COMPARTIDOS CRM (Personas y Tratos) ──

export const INITIAL_PERSONAS = [
  { id: 1, nombre: 'Agustina Vidal', email: 'agustina.vidal@llventino.com', telefono: '+1(555) 321-9874', cargo: 'Fundadora', empresa: 'Sector Cinco Décor', resp: 'Sofia Navara', tags: ['Mañana'], act: 'hace 2 días', pais: 'Argentina' },
  { id: 2, nombre: 'André Castro', email: 'andrea.castro@avacen.com', telefono: '+1(555) 771-4515', cargo: 'Coordinación de Prod.', empresa: 'Norvet Agr Químico', resp: 'Valentina Ríos', tags: ['Mañana', 'Carne'], act: 'hace 1 semana', pais: 'Chile' },
  { id: 3, nombre: 'Antonella Roz', email: 'antonella.roz@nordika.com', telefono: '+1(555) 662-1102', cargo: 'Responsable de Imp.', empresa: 'Nordika Importa Srl', resp: 'Sofia Navara', tags: [], act: 'hace 3 semanas', pais: 'Uruguay' },
  { id: 4, nombre: 'Benjamín Molina', email: 'benjamin.molina@atlemar.com', telefono: '+1(555) 445-7765', cargo: 'Responsable de Compras', empresa: 'AtleMar Logística Fer.', resp: 'Mariana Ferreyra', tags: ['Manzana', 'Distribución'], act: 'hace 5 días', pais: 'Perú' },
  { id: 5, nombre: 'Bianca Ferrero', email: 'bianca.ferrero@lumen.com', telefono: '+1(555) 883-9912', cargo: 'Directora de Comercio', empresa: 'Lumen Eléctrico Arsa', resp: 'Valentina Ríos', tags: [], act: 'hace 1 mes', pais: 'Argentina' },
  { id: 6, nombre: 'Camila Fuentes', email: 'camila.fuentes@austral.com', telefono: '+1(555) 991-2345', cargo: 'Jefa de Compras', empresa: 'Austral Fresh Foods', resp: 'Sofia Navara', tags: [], act: 'hace 2 semanas', pais: 'Chile' },
  { id: 7, nombre: 'Cara Domínguez', email: 'cara.dominguez@dif.com', telefono: '+1(555) 553-0007', cargo: 'Directora de Operaciones', empresa: 'DIF Logística', resp: 'Mariana Ferreyra', tags: [], act: 'hace 4 días', pais: 'México' },
  { id: 8, nombre: 'Carolina Nuñez', email: 'carolina.nunez@proclave.com', telefono: '+1(555) 441-8899', cargo: 'Directora Comercial', empresa: 'Pro Clave Cosmética', resp: 'Valentina Ríos', tags: [], act: 'hace 6 días', pais: 'Colombia' },
  { id: 9, nombre: 'Diego Herrera', email: 'diego.herrera@blanco.com', telefono: '+1(555) 332-1144', cargo: 'Analista de Comercio', empresa: 'Blanco & Cía Textil', resp: 'Valentina Ríos', tags: [], act: 'hace 2 semanas', pais: 'Perú' },
  { id: 10, nombre: 'Elena Quiroga', email: 'elena.quiroga@condillos.com', telefono: '+1(555) 774-2211', cargo: 'Gerenta de Operaciones', empresa: 'Condillos Wines', resp: 'Laura Giménez', tags: [], act: 'hace 3 semanas', pais: 'Argentina' },
  { id: 11, nombre: 'Emilio Ramos', email: 'emilio.ramos@saratextil.com', telefono: '+1(555) 299-1454', cargo: 'Gerente de Planta', empresa: 'Sara Textiles', resp: 'Valentina Ríos', tags: [], act: 'hace 1 mes', pais: 'Colombia' },
  { id: 12, nombre: 'Emilio Turco', email: 'emilio.turco@condillos.com', telefono: '+1(555) 299-1455', cargo: 'Gerente General', empresa: 'Condillos Wines', resp: 'Laura Giménez', tags: [], act: 'hace 1 mes', pais: 'Argentina' },
  { id: 13, nombre: 'Daniel', email: 'daniel@ars-soluciones.com', telefono: '+51 902 794 444', cargo: 'Gerente Comercial', empresa: 'Andex Trading Co.', resp: 'Marcos Ferreyra', tags: ['Nuevo lead'], act: 'Hoy', pais: 'Perú' },
  { id: 14, nombre: 'Ramiro López', email: 'ramiro.lopez@andex-trading-co.com', telefono: '+1(555) 262-1283', cargo: 'Gerente Comercial Local CAN', empresa: 'Andex Trading Co.', resp: 'Marcos Ferreyra', tags: ['Activo'], act: 'Hoy', pais: 'Perú' },
  { id: 15, nombre: 'Capricho Hair Nails', email: 'contacto@capricho-hair.com', telefono: '+51 932 890 838', cargo: 'Propietaria / Administración', empresa: 'Capricho Salón & Spa', resp: 'Daniel Valiente', tags: ['Nuevo lead'], act: 'Hoy', pais: 'Perú' },
];

export const INITIAL_TRATOS = [
  { id: 1, title: 'Bustos - Almacenaje + fulfillment', etapa: 'Negociación', valor: 'USD 14.000', resp: 'Diego Paranas', empresa: 'Patagonia Seafood', persona: 'Marina Bustos', cierre: '31/8/2026', prob: '50%' },
  { id: 2, title: 'Vega - Flete aéreo express', etapa: 'Cerrado ✓', valor: 'USD 25.000', resp: 'Valentina Ríos', empresa: 'Sara Textiles', persona: 'Camila Vega', cierre: '15/8/2026', prob: '100%' },
  { id: 3, title: 'Díaz - Almacenaje - Fulfillment', etapa: 'Lead nuevo', valor: 'USD 1.800', resp: 'Laura Jiménez', empresa: 'Tecnar Distribución', persona: 'Mateo Díaz', cierre: '22/8/2026', prob: '10%', tags: ['Mañana', 'Activo'] },
  { id: 4, title: 'Ramón - Flete marítimo', etapa: 'Negociación', valor: 'USD 3.500', resp: 'Diego Paranas', empresa: 'Patagonia Seafood', persona: 'Julieta Ramón', cierre: '11/8/2026', prob: '54%' },
  { id: 5, title: 'Vega - Seguro de camiones', etapa: 'Cerrado ✓', valor: 'USD 28.000', resp: 'Diego Paranas', empresa: 'Sara Textiles', persona: 'Sierra Textiles', cierre: '11/9/2026', prob: '100%' },
  { id: 6, title: 'López - Almacenaje + fulfillment', etapa: 'Negociación', valor: 'USD 15.000', resp: 'Marcos Ferreyra', empresa: 'Andex Trading Co.', persona: 'Ramiro López', cierre: '31/8/2026', prob: '50%', tags: ['Activo'] },
  { id: 7, title: 'López — Flete aéreo express', etapa: 'Propuesta enviada', valor: 'USD 2.000', resp: 'Marcos Ferreyra', empresa: 'Andex Trading Co.', persona: 'Ramiro López', cierre: '25/8/2026', prob: '50%' },
  { id: 8, title: 'López — Flete marítimo FCL', etapa: 'Negociación', valor: 'USD 8.000', resp: 'Marcos Ferreyra', empresa: 'Andex Trading Co.', persona: 'Ramiro López', cierre: '18/8/2026', prob: '50%' },
  { id: 9, title: 'Daniel — Campaña CRM & WhatsApp', etapa: 'Negociación', valor: 'USD 3.500', resp: 'Marcos Ferreyra', empresa: 'Andex Trading Co.', persona: 'Daniel', cierre: '15/9/2026', prob: '60%' },
  { id: 10, title: 'Daniel — Paquete Automatización', etapa: 'Propuesta enviada', valor: 'USD 1.200', resp: 'Marcos Ferreyra', empresa: 'Andex Trading Co.', persona: 'Daniel', cierre: '28/9/2026', prob: '40%' },
  { id: 11, title: 'Capricho — Plan Redes y WhatsApp', etapa: 'Lead nuevo', valor: 'USD 800', resp: 'Daniel Valiente', empresa: 'Capricho Salón & Spa', persona: 'Capricho Hair Nails', cierre: '05/9/2026', prob: '20%' },
];

export function getStoredPersonas() {
  try {
    const raw = localStorage.getItem('ap_crm_personas');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_PERSONAS;
}

export function saveStoredPersonas(personas) {
  try {
    localStorage.setItem('ap_crm_personas', JSON.stringify(personas));
    window.dispatchEvent(new Event('crm_personas_updated'));
  } catch {}
}

export function getStoredTratos() {
  try {
    const raw = localStorage.getItem('ap_crm_tratos');
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_TRATOS;
}

export function saveStoredTratos(tratos) {
  try {
    localStorage.setItem('ap_crm_tratos', JSON.stringify(tratos));
    window.dispatchEvent(new Event('crm_tratos_updated'));
  } catch {}
}

export function findPersonaForContact(contactName, contactPhone = '') {
  const personas = getStoredPersonas();
  const cleanPhone = String(contactPhone).replace(/\D/g, '');

  // 1. Buscar por coincidencia de teléfono
  if (cleanPhone.length >= 6) {
    const byPhone = personas.find(p => {
      const pClean = String(p.telefono).replace(/\D/g, '');
      return pClean && (pClean.includes(cleanPhone) || cleanPhone.includes(pClean));
    });
    if (byPhone) return byPhone;
  }

  // 2. Buscar por nombre exacto o contenido
  if (contactName) {
    const normContact = contactName.toLowerCase().trim();
    const byName = personas.find(p => {
      const pNorm = p.nombre.toLowerCase().trim();
      return pNorm === normContact || pNorm.includes(normContact) || normContact.includes(pNorm);
    });
    if (byName) return byName;
  }

  // 3. Fallback dinámico vinculado a este contacto
  return {
    id: `dyn_${cleanPhone || Date.now()}`,
    nombre: contactName || 'Contacto CRM',
    email: `${(contactName || 'contacto').toLowerCase().replace(/[^a-z0-9]/g, '.')}@gmail.com`,
    telefono: contactPhone || '',
    cargo: 'Gerente Comercial',
    empresa: 'Andex Trading Co.',
    resp: 'Marcos Ferreyra',
    tags: ['Nuevo lead'],
    act: 'Hoy',
    pais: 'Perú'
  };
}

export function getTratosForPersona(personaName) {
  const tratos = getStoredTratos();
  if (!personaName) return [];
  const normName = personaName.toLowerCase().trim();
  const matches = tratos.filter(t => {
    const pNorm = (t.persona || '').toLowerCase().trim();
    return pNorm === normName || pNorm.includes(normName) || normName.includes(pNorm);
  });

  if (matches.length > 0) return matches;

  // Si no tiene tratos creados aún, devolver tratos predeterminados vinculados para demostración completa
  return [
    {
      id: `tr_${Date.now()}_1`,
      title: `${personaName} — Propuesta Comercial FCL`,
      etapa: 'Propuesta enviada',
      valor: 'USD 2.500',
      resp: 'Marcos Ferreyra',
      empresa: 'Andex Trading Co.',
      persona: personaName,
      cierre: '20/11/2026',
      prob: '50%'
    },
    {
      id: `tr_${Date.now()}_2`,
      title: `${personaName} — Flete y Logística Integral`,
      etapa: 'Negociación',
      valor: 'USD 4.800',
      resp: 'Marcos Ferreyra',
      empresa: 'Andex Trading Co.',
      persona: personaName,
      cierre: '15/12/2026',
      prob: '70%'
    }
  ];
}
