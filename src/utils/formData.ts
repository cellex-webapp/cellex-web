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

    if (Array.isArray(val)) {
      // If it's an array of File objects, append each file individually under the same key
      const allFiles = val.every((it: any) => typeof File !== 'undefined' && it instanceof File);
      if (allFiles) {
        for (const fileItem of val) {
          try {
            fd.append(key, fileItem, (fileItem as File).name || key);
          } catch (e) {
            fd.append(key, fileItem as any);
          }
        }
        continue;
      }

      // Otherwise stringify the array/object
      try {
        fd.append(key, JSON.stringify(val));
      } catch (e) {
        fd.append(key, String(val));
      }
      continue;
    }

    if (typeof val === 'object') {
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
