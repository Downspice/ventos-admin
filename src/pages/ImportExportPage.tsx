import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "../components/PageHeader";
import { useState } from "react";

const EXPORT = gql`
  mutation ExportProducts {
    exportProductsCsv {
      filename
      csv
    }
  }
`;

const IMPORT = gql`
  mutation ImportProducts($csv: String!) {
    importProductsCsv(csv: $csv)
  }
`;

export default function ImportExportPage() {
  const [exportProducts, { data, loading }] = useMutation<{
    exportProductsCsv?: { filename: string; csv: string };
  }>(EXPORT);
  const [importProducts, { loading: importing }] = useMutation<{ importProductsCsv?: number }>(IMPORT);
  const [csv, setCsv] = useState("id,name,sku,barcode,price,cost\n,\"Imported Item\",,,9.99,5");

  function download() {
    const blob = new Blob([data?.exportProductsCsv?.csv ?? ""], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = data?.exportProductsCsv?.filename ?? "products.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader title="Import / export" description="Bulk product CSV tools." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 text-sm font-medium">Export</h3>
            <Button disabled={loading} onClick={() => void exportProducts().then(download)}>
              Export products CSV
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <h3 className="mb-3 text-sm font-medium">Import</h3>
            <div className="grid gap-2">
              <Label>Paste CSV</Label>
              <Textarea
                className="min-h-[120px] font-mono text-xs"
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
              />
              <Button
                disabled={importing}
                onClick={() =>
                  void importProducts({ variables: { csv } }).then((r) => {
                    alert(`Imported ${r.data?.importProductsCsv ?? 0} rows`);
                  })
                }
              >
                Import products
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
