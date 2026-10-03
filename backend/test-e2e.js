// E2E Test

async function test() {
  const ts = Date.now();
  console.log('--- STARTING E2E TEST ---');

  // 1. Signup
  const email = 'proptest' + ts + '@example.com';
  const phone = Date.now().toString().slice(-10);
  const signupRes = await fetch('http://localhost:3000/api/v1/rent/user/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'E2E Tester', email, password: 'Password1!', passwordConfirm: 'Password1!', phoneNumber: phone })
  });
  const cookie = signupRes.headers.get('set-cookie');
  const signupData = await signupRes.json();
  console.log('Signup:', signupRes.status, signupData);

  const base64Jpg = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
  const buffer = Buffer.from(base64Jpg, 'base64');
  
  const images = [];
  for (let i = 0; i < 6; i++) {
    const authRes = await fetch('http://localhost:3000/api/v1/rent/user/imagekit-auth', {
      headers: { Cookie: cookie }
    });
    const authParams = await authRes.json();
    if (i === 0) console.log('Auth Params:', authParams);
    if(!authParams.token) throw new Error('Missing token from ImageKit auth');

    const formData = new FormData();
    formData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'test' + i + '.jpg');
    formData.append('publicKey', authParams.publicKey);
    formData.append('signature', authParams.signature);
    formData.append('expire', authParams.expire);
    formData.append('token', authParams.token);
    formData.append('fileName', 'e2e_prop_' + ts + '_' + i + '.jpg');
    formData.append('folder', 'property_images');

    const uploadRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData
    });
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.log('Upload error response:', errText);
      throw new Error('Image upload failed: ' + uploadRes.status);
    }
    const data = await uploadRes.json();
    images.push({ url: data.url, public_id: data.fileId });
  }
  console.log('Uploaded 6 images. First URL:', images[0].url);
  
  // 4. Create property
  const payload = {
    propertyName: 'E2E Property ' + ts,
    description: 'E2E Description',
    propertyType: 'House',
    roomType: 'Entire Home',
    maximumGuest: 4,
    price: 2500,
    address: { area: 'Area', city: 'City', state: 'State', pincode: 100000 },
    amenities: [ { name: 'Wifi', icon: 'wifi' } ],
    images: images
  };
  
  const createRes = await fetch('http://localhost:3000/api/v1/rent/user/newAccommodation', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(payload)
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error('Property creation failed: ' + text);
  }
  const createData = await createRes.json();
  console.log('Create Property:', createRes.status);
  const propId = createData.data?.data?._id;
  if (!propId) throw new Error('Property creation failed: ' + JSON.stringify(createData));

  // 5. Verify Homepage
  const listRes = await fetch('http://localhost:3000/api/v1/rent/listing?page=1&sort=-createdAt');
  const listData = await listRes.json();
  const found = listData.data.find(p => p._id === propId);
  console.log('Homepage Visibility:', !!found);
  
  // 6. Verify Property Details
  const detRes = await fetch('http://localhost:3000/api/v1/rent/listing/' + propId);
  const detData = await detRes.json();
  console.log('Property Details Images:', detData.data?.images?.length);
  
  // 7. Edit Property
  images.pop(); // remove one
  const editAuthRes = await fetch('http://localhost:3000/api/v1/rent/user/imagekit-auth', {
    headers: { Cookie: cookie }
  });
  const editAuthParams = await editAuthRes.json();

  const newFormData = new FormData();
  newFormData.append('file', new Blob([buffer], { type: 'image/jpeg' }), 'edit.jpg');
  newFormData.append('publicKey', editAuthParams.publicKey);
  newFormData.append('signature', editAuthParams.signature);
  newFormData.append('expire', editAuthParams.expire);
  newFormData.append('token', editAuthParams.token);
  newFormData.append('fileName', 'e2e_edit_' + ts + '.jpg');
  newFormData.append('folder', 'property_images');
  
  const editUpRes = await fetch('https://upload.imagekit.io/api/v1/files/upload', { method: 'POST', body: newFormData });
  const editUpData = await editUpRes.json();
  images.push({ url: editUpData.url, public_id: editUpData.fileId });
  
  payload.images = images;
  payload.propertyName = 'E2E Edited ' + ts;
  
  const editRes = await fetch('http://localhost:3000/api/v1/rent/user/accommodation/' + propId, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify(payload)
  });
  console.log('Edit Property:', editRes.status);
  
  // 8. Delete Property
  const delRes = await fetch('http://localhost:3000/api/v1/rent/user/accommodation/' + propId, {
    method: 'DELETE',
    headers: { Cookie: cookie }
  });
  console.log('Delete Property:', delRes.status);
  
  console.log('DONE.');
}
test().catch(console.error);
