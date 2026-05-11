import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Trade = {
  id: number;
  symbol: string;
  entry_date: string;
  entry_price: number;
  qty: number;

  last_price: number | null;
  last_update_date: string | null;

  highest_close: number | null;

  structural_stop: number | null;
  atr_stop: number | null;
  final_stop: number | null;

  trail_active: number;
  trail_stop: number | null;

  partial_booked: number;

  exit_signal: number;
  exit_signal_reason: string | null;
};

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrades = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/trades/open");
      setTrades(res.data);
    } catch (err) {
      console.error("Error fetching trades:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this trade?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/trades/${id}`);
      fetchTrades();
    } catch (err) {
      console.error("Error deleting trade:", err);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const formatNumber = (val: any) => {
    if (val === null || val === undefined) return "-";
    return Number(val).toFixed(2);
  };

  const calculatePnL = (trade: Trade) => {
    if (!trade.last_price) return { pnlRs: "-", pnlPct: "-" };

    const pnlRs = (trade.last_price - trade.entry_price) * trade.qty;
    const pnlPct = ((trade.last_price / trade.entry_price) - 1) * 100;

    return {
      pnlRs: pnlRs.toFixed(0),
      pnlPct: pnlPct.toFixed(2),
    };
  };

  return (
    <div className="p-6">
      <Card className="shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Open Trades Dashboard</CardTitle>
            <p className="text-sm text-muted-foreground">
              Weekly Pulse Breaker v3 system monitoring (live engine)
            </p>
          </div>

          <Button onClick={fetchTrades} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </CardHeader>

        <CardContent>
          <div className="overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Entry Date</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Qty</th>
                  <th className="p-3">Last Price</th>
                  <th className="p-3">Highest Close</th>
                  <th className="p-3">Struct Stop</th>
                  <th className="p-3">ATR Stop</th>
                  <th className="p-3">Final Stop</th>
                  <th className="p-3">Trail Active</th>
                  <th className="p-3">Trail Stop</th>
                  <th className="p-3">Partial</th>
                  <th className="p-3">Exit Signal</th>
                  <th className="p-3">PnL (₹)</th>
                  <th className="p-3">PnL (%)</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {trades.length === 0 && (
                  <tr>
                    <td colSpan={16} className="p-4 text-center text-muted-foreground">
                      No open trades found.
                    </td>
                  </tr>
                )}

                {trades.map((trade) => {
                  const pnl = calculatePnL(trade);

                  return (
                    <tr key={trade.id} className="border-t hover:bg-muted/50">
                      <td className="p-3 font-semibold">{trade.symbol}</td>
                      <td className="p-3">{trade.entry_date}</td>
                      <td className="p-3">{formatNumber(trade.entry_price)}</td>
                      <td className="p-3">{trade.qty}</td>

                      <td className="p-3">{formatNumber(trade.last_price)}</td>
                      <td className="p-3">{formatNumber(trade.highest_close)}</td>

                      <td className="p-3">{formatNumber(trade.structural_stop)}</td>
                      <td className="p-3">{formatNumber(trade.atr_stop)}</td>
                      <td className="p-3 font-semibold">{formatNumber(trade.final_stop)}</td>

                      <td className="p-3">
                        {trade.trail_active === 1 ? (
                          <span className="text-green-600 font-semibold">YES</span>
                        ) : (
                          <span className="text-gray-500">NO</span>
                        )}
                      </td>

                      <td className="p-3">{formatNumber(trade.trail_stop)}</td>

                      <td className="p-3">
                        {trade.partial_booked === 1 ? (
                          <span className="text-green-600 font-semibold">YES</span>
                        ) : (
                          <span className="text-gray-500">NO</span>
                        )}
                      </td>

                      <td className="p-3">
                        {trade.exit_signal === 1 ? (
                          <span className="text-red-600 font-semibold">
                            YES {trade.exit_signal_reason ? `(${trade.exit_signal_reason})` : ""}
                          </span>
                        ) : (
                          <span className="text-gray-500">NO</span>
                        )}
                      </td>

                      <td className="p-3 font-semibold">{pnl.pnlRs}</td>
                      <td className="p-3">{pnl.pnlPct}</td>

                      <td className="p-3">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(trade.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}