import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDisableTwoFactor,
  useEnableTwoFactor,
  useGenerateTwoFactorSetup,
  useRegenerateRecoveryCodes,
  useTwoFactorStatus,
} from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  QrCode,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function TwoFactorSection() {
  const { data: status, isLoading } = useTwoFactorStatus();
  const generateSetup = useGenerateTwoFactorSetup();
  const enableTwoFA = useEnableTwoFactor();
  const disableTwoFA = useDisableTwoFactor();
  const regenerateCodes = useRegenerateRecoveryCodes();

  const [step, setStep] = useState<
    "idle" | "setup" | "recovery" | "disable" | "regenerate"
  >("idle");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleStartSetup = async () => {
    await generateSetup.mutateAsync();
    setStep("setup");
    setCode("");
  };

  const handleEnable = async () => {
    const result = await enableTwoFA.mutateAsync(code);
    setRecoveryCodes(result.recoveryCodes);
    setCode("");
    setStep("recovery");
  };

  const handleDisable = async () => {
    await disableTwoFA.mutateAsync(code);
    setCode("");
    setStep("idle");
  };

  const handleRegenerateCodes = async () => {
    const result = await regenerateCodes.mutateAsync(code);
    setRecoveryCodes(result.recoveryCodes);
    setCode("");
    setStep("recovery");
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) return <Skeleton className="h-32" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
        </div>
        <CardDescription>
          Add an extra layer of security using an authenticator app.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status banner */}
        {status?.enabled ? (
          <div
            className={cn(
              "flex items-center justify-between p-3 rounded-lg",
              "bg-brand/10 border border-brand/20",
            )}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              <p className="text-sm font-medium text-foreground">
                2FA is enabled
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              {status.remainingRecoveryCodes} recovery code
              {status.remainingRecoveryCodes !== 1 ? "s" : ""} remaining
            </p>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg",
              "bg-yellow-500/10 border border-yellow-500/20",
            )}
          >
            <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
            <p className="text-sm text-foreground">
              Two-factor authentication is not enabled.
            </p>
          </div>
        )}

        {/* Setup step — show QR code */}
        {step === "setup" && generateSetup.data && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan this QR code with your authenticator app (Google
              Authenticator, Authy, etc.), then enter the 6-digit code below.
            </p>
            <div className="flex justify-center">
              <Image
                src={generateSetup.data.qrCode}
                alt="QR Code"
                width={180}
                height={180}
                className="rounded-lg border border-border"
              />
            </div>
            <div className="p-3 rounded-lg bg-muted border border-border">
              <p className="text-xs text-muted-foreground mb-1">
                Can&lsquo;t scan? Enter this code manually:
              </p>
              <code className="text-sm font-mono text-foreground break-all">
                {generateSetup.data.secret}
              </code>
            </div>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            {enableTwoFA.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Invalid code. Please try again.
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                onClick={handleEnable}
                disabled={code.length !== 6 || enableTwoFA.isPending}
              >
                {enableTwoFA.isPending ? "Verifying..." : "Enable 2FA"}
              </Button>
            </div>
          </div>
        )}

        {/* Recovery codes — shown once after enabling */}
        {step === "recovery" && (
          <div className="space-y-4">
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "bg-yellow-500/10 border border-yellow-500/20",
              )}
            >
              <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Save these recovery codes somewhere safe. Each code can only be
                used once if you lose access to your authenticator.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4 rounded-lg bg-muted border border-border font-mono text-sm">
              {recoveryCodes.map((code) => (
                <span key={code} className="text-foreground">
                  {code}
                </span>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={copyRecoveryCodes}
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy all codes"}
            </Button>
            <Button
              className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
              onClick={() => setStep("idle")}
            >
              Done — I&lsquo;ve saved my codes
            </Button>
          </div>
        )}

        {/* Disable step */}
        {step === "disable" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your current 6-digit authenticator code to disable 2FA.
            </p>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            {disableTwoFA.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Invalid code. Please try again.
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDisable}
                disabled={code.length !== 6 || disableTwoFA.isPending}
              >
                {disableTwoFA.isPending ? "Disabling..." : "Disable 2FA"}
              </Button>
            </div>
          </div>
        )}

        {/* Regenerate codes step */}
        {step === "regenerate" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Enter your current 6-digit code to regenerate recovery codes. All
              existing codes will be invalidated.
            </p>
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                placeholder="000000"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="font-mono text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            {regenerateCodes.isError && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Invalid code. Please try again.
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("idle");
                  setCode("");
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                onClick={handleRegenerateCodes}
                disabled={code.length !== 6 || regenerateCodes.isPending}
              >
                {regenerateCodes.isPending ? "Regenerating..." : "Regenerate"}
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons — idle state */}
        {step === "idle" && (
          <div className="flex flex-wrap gap-3">
            {!status?.enabled ? (
              <Button
                className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                onClick={handleStartSetup}
                disabled={generateSetup.isPending}
              >
                <QrCode className="w-4 h-4 mr-2" />
                {generateSetup.isPending ? "Generating..." : "Set up 2FA"}
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep("regenerate");
                    setCode("");
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate recovery codes
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={() => {
                    setStep("disable");
                    setCode("");
                  }}
                >
                  Disable 2FA
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
