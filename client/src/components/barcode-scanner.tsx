import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Camera, Type } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [useManualInput, setUseManualInput] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && !useManualInput) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, useManualInput]);

  const startCamera = async () => {
    try {
      setError("");
      setIsScanning(true);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment" // Prefer back camera
        }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError("لا يمكن الوصول إلى الكاميرا. يرجى التأكد من الصلاحيات.");
      setUseManualInput(true);
    } finally {
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  // Simulate barcode detection for demo
  const simulateBarcodeScan = () => {
    // This would integrate with a real barcode scanning library like QuaggaJS or ZXing
    const mockBarcodes = ["ICU-001", "VENT-003", "RAD-105"];
    const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
    onScan(randomBarcode);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">مسح الباركود</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {!useManualInput ? (
            <div className="space-y-4">
              {/* Camera Scanner */}
              <div className="relative">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative">
                  {isScanning ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--medical-blue)]"></div>
                    </div>
                  ) : error ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <Camera className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                  )}
                  
                  {/* Scanning overlay */}
                  <div className="absolute inset-0 border-2 border-[var(--medical-blue)] border-dashed rounded-lg opacity-50"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-[var(--medical-blue)] rounded-lg"></div>
                </div>
              </div>

              <p className="text-sm text-gray-600 text-center">
                ضع الباركود داخل الإطار
              </p>

              {/* Demo scan button */}
              <Button
                onClick={simulateBarcodeScan}
                className="w-full btn-medical"
              >
                <Camera className="w-4 h-4 ml-2" />
                محاكاة مسح (للتجربة)
              </Button>

              <Button
                variant="outline"
                onClick={() => setUseManualInput(true)}
                className="w-full"
              >
                <Type className="w-4 h-4 ml-2" />
                إدخال يدوي
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Manual Input */}
              <div>
                <Label htmlFor="manual-barcode">كود الجهاز</Label>
                <Input
                  id="manual-barcode"
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  placeholder="أدخل كود الجهاز..."
                  className="mt-1 number"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleManualSubmit}
                  disabled={!manualBarcode.trim()}
                  className="btn-medical"
                >
                  تأكيد
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUseManualInput(false);
                    setManualBarcode("");
                    setError("");
                  }}
                >
                  <Camera className="w-4 h-4 ml-2" />
                  عودة للكاميرا
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
