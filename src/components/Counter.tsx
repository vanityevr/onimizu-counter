"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { CardContent, Card } from "./ui/card";
import Image from "next/image";
import { Input } from "./ui/input";
import { toast } from "@/hooks/use-toast";

export const Counter = () => {
  const [siodla, setSiodla] = useState<number>(0);
  const [zrobione, setZrobione] = useState<number>(0);
  const [donate, setDonate] = useState<string>("");
  const [customAdd, setCustomAdd] = useState<string>("");
  const [customSubtract, setCustomSubtract] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [flyingIcons, setFlyingIcons] = useState<{ id: number; src: string; x: number; y: number; directionX: number; directionY: number }[]>([]);

  useEffect(() => {
    const getInitialState = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/getCounter");
        const data = await res.json();
        const doneRes = await fetch("/api/getDone");
        const doneData = await doneRes.json();
        if(doneData.done === undefined || doneData.data === null) {
          saveZrobione(0);
        }
        setZrobione(doneData.done || 0);
        setSiodla(data.counter || 0);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        toast({title: 'Coś się popsuło', description:'Nie udało się pobrać informacji'})
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
  

  const convertDonationToSiodla = () => {
    const donationAmount = parseFloat(donate);
    if (isNaN(donationAmount)) {
      toast({ title: "Mało!", description: "Nie ma siodeł za tak małego donate", variant: "destructive" });
      return;
    }
    if (donationAmount < 20) {
      toast({ title: "Mało!", description: "Nie ma siodeł za tak małego donate", variant: "destructive" });
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
    const today = new Date().toISOString().split('T')[0];
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
      setZrobione((prev) => prev-delta);
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
      <h1 className="text-4xl font-bold text-center sm:text-left">OniMizu&apos;s Siodło Counter</h1>
      <Image src="/static/images/mizu.png" alt="mizu" width={350} height={350} className="rounded-[50%]" />
      <div className='flex flex-row gap-8'>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-bold">Siodła zrobione dzisiaj:</h1>
       <p className="text-3xl font-bold">{zrobione}</p>
      </div>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-bold">Siodła do wykonania:</h1>
        {loading ? <p className="text-3xl font-bold">?</p> : <p className="text-3xl font-bold">{siodla}</p>}
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
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-1, "/static/images/cheer.png")}><Image src="/static/images/cheer.png" alt="cheer" width={20} height={20}/>1</Button>
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-2, "/static/images/love.png")}><Image src="/static/images/love.png" alt="mizuLove" width={20} height={20}/>2</Button>
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-5, "/static/images/beka.png")}><Image src="/static/images/beka.png" alt="beka" width={20} height={20}/>5</Button>
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-10, "/static/images/ok.png")}><Image src="/static/images/ok.png" alt="ok" width={20} height={20}/>10</Button>
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-20, "/static/images/mizuShy.png")}><Image src="/static/images/mizuShy.png" alt="mizuShy" width={20} height={20}/>20</Button>
              <Button className="bg-pink-600" onClick={() => adjustSiodla(-50, "/static/images/cheer.png")}><Image src="/static/images/cheer.png" alt="cheer" width={20} height={20}/>50</Button>

            </div>
            {/* Custom Subtraction */}
            <Input type="number" className="w-1/2" value={customSubtract} onChange={(e) => setCustomSubtract(e.target.value)} placeholder="Ile siodeł już zrobiłaś? (Custom)" />
            <Button className="bg-pink-600" onClick={() => adjustSiodla(-parseFloat(customSubtract), "/static/images/custom_subtract.png")}>Odejmij siodła</Button>
          </CardContent>
        </Card>

        {/* Addition Card */}
        <Card>
          <CardContent className="flex flex-col gap-2 items-center">
            <h1 className="mt-2 font-bold">A DONATE BYŁ?</h1>
            <div className="flex flex-wrap gap-2 justify-evenly">
              <Button className="bg-green-700" onClick={() => adjustSiodla(1, "/static/images/wstydzioch.png")}><Image src="/static/images/wstydzioch.png" alt="wstydzioch" width={20} height={20}/>+1</Button>
              <Button className="bg-green-700" onClick={() => adjustSiodla(2, "/static/images/pat.png")}><Image src="/static/images/pat.png" alt="pat" width={20} height={20}/>+2</Button>
              <Button className="bg-green-700" onClick={() => adjustSiodla(5, "/static/images/huh.png")}><Image src="/static/images/huh.png" alt="huh" width={20} height={20}/>+5</Button>
              <Button className="bg-green-700" onClick={() => adjustSiodla(10, "/static/images/wow.png")}><Image src="/static/images/wow.png" alt="wow" width={20} height={20}/>+10</Button>
              <Button className="bg-green-700" onClick={() => adjustSiodla(20, "/static/images/mad.png")}><Image src="/static/images/mad.png" alt="mad" width={20} height={20}/>+20</Button>
              <Button className="bg-green-700" onClick={() => adjustSiodla(50, "/static/images/sad.png")}><Image src="/static/images/sad.png" alt="sad" width={20} height={20}/>+50</Button>

            </div>
            {/* Custom Addition */}
            <Input type="number" className="w-1/2"  value={customAdd} onChange={(e) => setCustomAdd(e.target.value)} placeholder="Ile siodeł doszło? (Custom)" />
            <Button className="bg-green-700" onClick={() => adjustSiodla(parseFloat(customAdd), "/static/images/custom_add.png")}>Dodaj siodła</Button>
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
            />
            <Button className="bg-blue-500" onClick={convertDonationToSiodla}>
              Dodaj siodła
            </Button>
          </CardContent>
        </Card>
      </div>
    </CardContent>
  );
};
