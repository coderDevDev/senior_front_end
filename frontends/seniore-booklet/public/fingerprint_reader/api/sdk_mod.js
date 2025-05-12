                    (function () {
                        const Fingerprint = window.Fingerprint;

                        console.log("Fingerprint SDK initializing");
                        
                        // Create the FingerprintSdk constructor
                        const FingerprintSdk = (function () {
                            function FingerprintSdk() {
                                console.log("Creating FingerprintSdk instance");
                                this.sdk = new Fingerprint.WebApi();

                                this.sdk.onSamplesAcquired = function(s) {
                                    samplesAcquired(s);
                                };
                            }

                            FingerprintSdk.prototype.getDeviceList = function () { 
                                console.log("getDeviceList called");
                                return this.sdk.enumerateDevices(); 
                            };

                            FingerprintSdk.prototype.startCapture = function () {
                                console.log("startCapture called");
                                this.sdk.startAcquisition(Fingerprint.SampleFormat.PngImage).then(function () {
                                    return console.log('Capturing fingerprint');
                                }, function (error) {
                                    return console.log('Error starting fingerprint capture', error);
                                });
                            };

                            FingerprintSdk.prototype.stopCapture = function () {
                                console.log("stopCapture called");
                                this.sdk.stopAcquisition().then(function () {
                                    return console.log('Fingerprint capture stopped');
                                }, function (error) {
                                    return console.log('Error stopping fingerprint capture', error);
                                });
                            };

                            return FingerprintSdk;
                        })();

                        function samplesAcquired(s){   
                            console.log("Sample acquired:", s);
                            localStorage.setItem("imageSrc", "");                
                            let samples = JSON.parse(s.samples);            
                            localStorage.setItem("imageSrc", "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
                            let vDiv = document.getElementById('imagediv');
                            vDiv.innerHTML = "";
                            let image = document.createElement("img");
                            image.id = "image";
                            image.src = localStorage.getItem("imageSrc");
                            vDiv.appendChild(image);
                        }

                        // IMPORTANT: Make FingerprintSdk available globally instead of using module.exports
                        window.FingerprintSdk = FingerprintSdk;
                        
                        console.log("FingerprintSdk initialized and available globally:", !!window.FingerprintSdk);
                        
                        // Trigger an event to signal that the SDK is ready
                        document.dispatchEvent(new CustomEvent('fingerprintSdkReady'));
                    })();
