const CLOUD_NAME = 'dqoigfc4g';
const UPLOAD_PRESET = 'Sabiamente-app';

export const subirImagenCloudinary = async (uriImagen: string): Promise<string> => {
  const formData = new FormData();

  formData.append('file', {
    uri: uriImagen,
    type: 'image/jpeg',
    name: 'perfil.jpg',
  } as any);

  formData.append('upload_preset', UPLOAD_PRESET);

  const respuesta = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await respuesta.json();

  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error('Error al subir la imagen a Cloudinary');
  }
};