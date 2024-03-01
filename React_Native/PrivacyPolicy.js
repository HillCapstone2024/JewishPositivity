import React from 'react';
import * as WebBrowser from 'expo-web-browser';


const PrivacyPolicy = async () => {
    const url = "https://drive.google.com/file/d/15TGCUb7dvpNorO9IcGfiyDL60WatPa07/edit";
    await WebBrowser.openBrowserAsync(url);
};

export default PrivacyPolicy;
