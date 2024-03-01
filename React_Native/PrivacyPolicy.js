import React from 'react';
import Pdf from 'react-native-pdf';

const PrivacyPolicy = () => {

    return (
        <Pdf
            source={require("./assets/PRIVACY POLICY.pdf")}
            onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
            }}
            onError={(error) => {
                console.log(error);
            }}
            style={{ flex: 1 }}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
});

export default PrivacyPolicy;
