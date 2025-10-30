export function isFormData(obj: any): obj is FormData {
  return typeof FormData !== 'undefined' && obj instanceof FormData;
}

export function toFormData(payload: Record<string, any> | undefined | null): FormData {
  const fd = new FormData();
  if (!payload) return fd;

  for (const key of Object.keys(payload)) {
    const val = payload[key];
    if (val === undefined || val === null) continue;

    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      fd.append(key, String(val));
      continue;
    }

    if (typeof File !== 'undefined' && val instanceof File) {
      try {
        fd.append(key, val, (val as File).name || key);
      } catch (e) {
        fd.append(key, val as any);
      }
      continue;
    }

    if (Array.isArray(val) || typeof val === 'object') {
      try {
        fd.append(key, JSON.stringify(val));
      } catch (e) {
        fd.append(key, String(val));
      }
      continue;
    }

    fd.append(key, String(val));
  }

  return fd;
}

export default toFormData;
