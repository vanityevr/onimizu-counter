"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { CardContent, Card } from "./ui/card";
import Image from "next/image";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";
import { useCookies } from "next-client-cookies";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";

export const Counter = () => {
  const [siodla, setSiodla] = useState<number>(0);
  const [zrobione, setZrobione] = useState<number>(0);
  const [donate, setDonate] = useState<string>("");
  const [customAdd, setCustomAdd] = useState<string>("");
  const [customSubtract, setCustomSubtract] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [accessKey, setAccessKey] = useState<string>("");
  const [dialogOpen, setDialogOpen] =useState(false);
  const cookies = useCookies();
  const functionsDisabled = cookies.get('access') === 'true' ? false : true;
  const [flyingIcons, setFlyingIcons] = useState<
    {
      id: number;
      src: string;
      x: number;
      y: number;
      directionX: number;
      directionY: number;
    }[]
  >([]);

  useEffect(() => {
    const getInitialState = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/getCounter");
        const data = await res.json();
        const doneRes = await fetch("/api/getDone");
        const doneData = await doneRes.json();
        if (doneData.done === undefined || doneData.data === null) {
          saveZrobione(0);
        }
        setZrobione(doneData.done || 0);
        setSiodla(data.counter || 0);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({
          title: "Coś się popsuło",
          description: "Nie udało się pobrać informacji",
        });
        setSiodla(0);
        setZrobione(0);
      }
      setLoading(false);
    };
    getInitialState();
  }, []);

  useEffect(() => {
    if (zrobione !== 0) {
      saveZrobione(zrobione);
    }
  }, [zrobione]);

  const unlockFunctions = async (key: string) => {
    const res = await fetch("/api/setAccess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: key }),
    });
    const data = await res.json();
    if (data.access === true) {
      onDialogStateChange();
      cookies.set("access", "true");
    }
  };

  const onDialogStateChange = () => {
    setDialogOpen(prev => !prev)
  }

  const convertDonationToSiodla = () => {
    const donationAmount = parseFloat(donate);
    if (isNaN(donationAmount)) {
      toast({
        title: "Mało!",
        description: "Nie ma siodeł za tak małego donate",
        variant: "destructive",
      });
      return;
    }
    if (donationAmount < 20) {
      toast({
        title: "Mało!",
        description: "Nie ma siodeł za tak małego donate",
        variant: "destructive",
      });
      return;
    }

    const siodlaToAdd = donationAmount / 2;
    const newSiodla = siodla + siodlaToAdd;

    setSiodla(newSiodla);
    saveCounter(newSiodla);
    setDonate("");
  };

  const saveCounter = async (newCounter: number) => {
    try {
      await fetch("/api/saveCounter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ counter: newCounter }),
      });
    } catch (error) {
      console.error("Error saving counter:", error);
    }
  };

  const saveZrobione = async (newValue: number) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await fetch("/api/saveDone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: today, value: newValue }),
      });
    } catch (error) {
      console.error("Error saving done counter:", error);
    }
  };

  const adjustSiodla = (delta: number, icon: string) => {
    setSiodla((prev) => Math.max(0, prev + delta));
    if (delta < 0) {
      setZrobione((prev) => prev - delta);
    }
    saveCounter(Math.max(0, siodla + delta));

    const numIcons = Math.floor(Math.random() * 4) + 5;
    const newIcons = Array.from({ length: numIcons }, (_, i) => ({
      id: Date.now() + i,
      src: icon,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight - 100,
      directionX: Math.random() * 200 - 100,
      directionY: Math.random() * -300 - 100,
    }));

    setFlyingIcons((prev) => [...prev, ...newIcons]);

    setTimeout(() => {
      setFlyingIcons((prev) => prev.filter((item) => !newIcons.includes(item)));
    }, 1500);
  };

  return (
    <CardContent className="relative bg-blue-300 rounded-xl px-8 py-4 flex flex-col gap-4 items-center overflow-hidden">
      <h1 className="text-4xl font-bold text-center sm:text-left">
        OniMizu&apos;s Siodło Counter
      </h1>
      <Image
        src="/static/images/mizu.png"
        alt="mizu"
        width={350}
        height={350}
        className="rounded-[50%]"
      />
      <div className="flex flex-row gap-8">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-xl font-bold">Siodła zrobione dzisiaj:</h1>
          <p className="text-3xl font-bold">{zrobione}</p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-xl font-bold">Siodła do wykonania:</h1>
          {loading ? (
            <p className="text-3xl font-bold">?</p>
          ) : (
            <p className="text-3xl font-bold">{siodla}</p>
          )}
        </div>
      </div>

      {/* Flying icons animation */}
      {flyingIcons.map((icon) => (
        <motion.img
          key={icon.id}
          src={icon.src}
          className="fixed w-24 h-24 opacity-50 pointer-events-none z-[9999]"
          style={{ left: icon.x, top: icon.y }}
          initial={{ opacity: 0.8, scale: 0.7 }}
          animate={{
            x: icon.directionX,
            y: icon.directionY,
            scale: 1.2,
            opacity: 0,
          }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ))}

      <div className="flex flex-wrap justify-evenly gap-4">
        {/* Subtraction Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 items-center">
            <h1 className="mt-2 font-bold">ILE SIODEŁ ZROBIONE?</h1>
            <div className="flex flex-wrap gap-2 justify-evenly">
              <Button
                className="bg-pink-600 hover:bg-pink-500"
                onClick={() => adjustSiodla(-10, "/static/images/ok.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/ok.png"
                  alt="ok"
                  width={20}
                  height={20}
                />
                10
              </Button>
              <Button
                className="bg-pink-600 hover:bg-pink-500"
                onClick={() => adjustSiodla(-20, "/static/images/mizuShy.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/mizuShy.png"
                  alt="mizuShy"
                  width={20}
                  height={20}
                />
                20
              </Button>
              <Button
                className="bg-pink-600 hover:bg-pink-500"
                onClick={() => adjustSiodla(-50, "/static/images/cheer.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/cheer.png"
                  alt="cheer"
                  width={20}
                  height={20}
                />
                50
              </Button>
              <Button
                className="bg-pink-600 hover:bg-pink-500"
                onClick={() => adjustSiodla(-100, "/static/images/beka.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/beka.png"
                  alt="beka"
                  width={20}
                  height={20}
                />
                100
              </Button>
            </div>
            {/* Custom Subtraction */}
            <Input
              type="number"
              className="w-4/5"
              value={customSubtract}
              onChange={(e) => setCustomSubtract(e.target.value)}
              placeholder="Ile siodeł już zrobiłaś? (Custom)"
              disabled={functionsDisabled}
            />
            <Button
              className="bg-pink-600 hover:bg-pink-500"
              onClick={() =>
                adjustSiodla(
                  -parseFloat(customSubtract),
                  "/static/images/custom_subtract.png"
                )
              }
              disabled={functionsDisabled}
            >
              Odejmij siodła
            </Button>
          </CardContent>
        </Card>

        {/* Addition Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 items-center">
            <h1 className="mt-2 font-bold">A DONATE BYŁ?</h1>
            <div className="flex flex-wrap gap-2 justify-evenly">
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => adjustSiodla(10, "/static/images/wow.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/wow.png"
                  alt="wow"
                  width={20}
                  height={20}
                />
                +10
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => adjustSiodla(20, "/static/images/mad.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/mad.png"
                  alt="mad"
                  width={20}
                  height={20}
                />
                +20
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => adjustSiodla(50, "/static/images/sad.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/sad.png"
                  alt="sad"
                  width={20}
                  height={20}
                />
                +50
              </Button>
              <Button
                className="bg-green-700 hover:bg-green-600"
                onClick={() => adjustSiodla(100, "/static/images/huh.png")}
                disabled={functionsDisabled}
              >
                <Image
                  src="/static/images/huh.png"
                  alt="huh"
                  width={20}
                  height={20}
                />
                +100
              </Button>
            </div>
            {/* Custom Addition */}
            <Input
              type="number"
              className="w-4/5"
              value={customAdd}
              disabled={functionsDisabled}
              onChange={(e) => setCustomAdd(e.target.value)}
              placeholder="Ile siodeł doszło? (Custom)"
            />
            <Button
              className="bg-green-700 hover:bg-green-600"
              onClick={() =>
                adjustSiodla(
                  parseFloat(customAdd),
                  "/static/images/custom_add.png"
                )
              }
              disabled={functionsDisabled}
            >
              Dodaj siodła
            </Button>
          </CardContent>
        </Card>
        {/* Donation Conversion Card */}
        <Card>
          <CardContent className="flex flex-col gap-4 items-center">
            <h1 className="mt-2 font-bold">PRZELICZ DONATE NA SIODŁA</h1>
            <Input
              type="number"
              value={donate}
              onChange={(e) => setDonate(e.target.value)}
              placeholder="Wpisz kwotę donate"
              disabled={functionsDisabled}
            />
            <Button className="bg-blue-500 hover:bg-blue-400" onClick={convertDonationToSiodla} disabled={functionsDisabled}>
              Dodaj siodła
            </Button>
          </CardContent>
        </Card>
      </div>
      <div>
      <Dialog open={dialogOpen} onOpenChange={onDialogStateChange}>
      <DialogTrigger asChild>
        <Button disabled={!functionsDisabled} variant="outline" className="bg-emerald-800 text-white text-md hover:bg-emerald-600 hover:text-white">Odblokuj funkcje</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-8">
        <DialogHeader>
          <DialogTitle>Odblokuj Funkcje</DialogTitle>
          <DialogDescription>
            Aby włączyć możliwość edytowania liczników, musisz podać klucz dostępu.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Klucz
            </Label>
            <Input
              id="key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              placeholder="Klucz dostępu"
              type="password"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => unlockFunctions(accessKey)}>Zweryfikuj</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
      </div>
    </CardContent>
  );
};
