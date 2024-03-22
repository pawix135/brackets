// import QRCode from "react-qr-code";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

const KodPage = () => {
  const [name, setName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [code, setCode] = useState<string>("");

  const createCode = () => {
    return `player://${name};${lastName}`;
  };

  useEffect(() => {
    setCode(createCode());
  }, [name, lastName]);

  return (
    <div className="max-w-[300px] mx-auto py-5 ">
      <Card>
        <CardHeader>
          <CardTitle>Stwórz kod gracza</CardTitle>
          <CardDescription>Tylko litery bez znaków diakrytycznych czyli ą, ć, ę, ł, ń, ó, ś, ź, ż</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="imie">Imię</Label>
            <Input id="imie" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="imie">Nazwisko</Label>
            <Input id="imie" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <QRCode value={code} />
        </CardContent>
      </Card>
    </div>
  );
};

export default KodPage;
