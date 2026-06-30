export const buildMapsLink = ({ latitude, longitude }) => `https://maps.google.com/?q=${latitude},${longitude}`;

export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve({
          latitude,
          longitude,
          mapsLink: buildMapsLink({ latitude, longitude })
        });
      },
      (error) => {
        const permissionDenied = error.code === error.PERMISSION_DENIED;
        reject(new Error(permissionDenied
          ? 'GPS permission was denied. Allow location access to send SMS with live location.'
          : 'Unable to retrieve GPS location. Please try again.'));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  });
};
