import { useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const CAPITAL_PER_TRADE = 40000;

export default function AddTrade() {
  const [symbol, setSymbol] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [entryPrice, setEntryPrice] = useState<number>(0);
  const [qty, setQty] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePriceChange = (value: string) => {
    const price = parseFloat(value);

    if (!price || price <= 0) {
      setEntryPrice(0);
      setQty(0);
      return;
    }

    setEntryPrice(price);
    setQty(Math.floor(CAPITAL_PER_TRADE / price));
  };

  const handleSubmit = async () => {
    setMessage("");

    if (!symbol.trim()) {
      setMessage("Symbol is required.");
      return;
    }

    if (!entryDate) {
      setMessage("Entry date is required.");
      return;
    }

    if (!entryPrice || entryPrice <= 0) {
      setMessage("Entry price must be valid.");
      return;
    }

    if (!qty || qty <= 0) {
      setMessage("Qty must be valid.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        symbol: symbol.toUpperCase(),
        entry_date: entryDate,
        entry_price: entryPrice,
        qty,
        notes,
      };

      await axios.post("http://localhost:5000/api/trades/add", payload);

      setMessage("✅ Trade added successfully.");

      // reset form
      setSymbol("");
      setEntryDate("");
      setEntryPrice(0);
      setQty(0);
      setNotes("");
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Failed to add trade. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Add New Trade</CardTitle>
          <p className="text-sm text-muted-foreground">
            Add an OPEN trade. System will track stops, trailing, and exits
            automatically.
          </p>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Symbol */}
          <div className="space-y-2">
            <Label>Stock Symbol</Label>
            <Input
              placeholder="Example: TCS"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>

          {/* Entry Date */}
          <div className="space-y-2">
            <Label>Entry Date</Label>
            <Input
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
            />
          </div>

          {/* Entry Price */}
          <div className="space-y-2">
            <Label>Entry Price</Label>
            <Input
              type="number"
              placeholder="Example: 3500"
              value={entryPrice === 0 ? "" : entryPrice}
              onChange={(e) => handlePriceChange(e.target.value)}
            />
          </div>

          {/* Qty */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <Input
              type="number"
              value={qty === 0 ? "" : qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground">
              Auto calculated using ₹40,000 capital per trade.
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Input
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-xl"
          >
            {loading ? "Adding Trade..." : "Add Trade"}
          </Button>

          {message && (
            <div className="text-sm font-medium text-center mt-3">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
