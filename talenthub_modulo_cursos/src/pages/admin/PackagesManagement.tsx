import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Package, Users, BookOpen, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PACKAGES } from "@/hooks/usePackageAccess";

const PackagesManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [talents, setTalents] = useState<any[]>([]);
  const [packageStats, setPackageStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load talents with their packages
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, email:id")
        .order("full_name");

      const { data: talentPackages } = await supabase
        .from("talent_packages")
        .select("*");

      const packageMap = new Map(talentPackages?.map(tp => [tp.talent_id, tp]) || []);

      const talentsWithPackages = (profiles || []).map(profile => ({
        ...profile,
        package: packageMap.get(profile.id),
      }));

      setTalents(talentsWithPackages);

      // Calculate stats
      const stats: Record<string, number> = { start: 0, advanced: 0, premium: 0, none: 0 };
      talentsWithPackages.forEach(t => {
        if (t.package) {
          stats[t.package.package_code] = (stats[t.package.package_code] || 0) + 1;
        } else {
          stats.none++;
        }
      });
      setPackageStats(stats);
    } catch (error) {
      console.error("Error loading data:", error);
      toast({ title: "Erro ao carregar dados", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const assignPackage = async (talentId: string, packageCode: string) => {
    try {
      const existingPackage = talents.find(t => t.id === talentId)?.package;

      if (existingPackage) {
        await supabase
          .from("talent_packages")
          .update({ package_code: packageCode, purchased_at: new Date().toISOString() })
          .eq("talent_id", talentId);
      } else {
        await supabase
          .from("talent_packages")
          .insert({ talent_id: talentId, package_code: packageCode });
      }

      toast({ title: "Pacote atualizado com sucesso!" });
      loadData();
    } catch (error) {
      console.error("Error assigning package:", error);
      toast({ title: "Erro ao atribuir pacote", variant: "destructive" });
    }
  };

  const filteredTalents = talents.filter(t =>
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar ao Admin
        </Button>

        <h1 className="text-3xl font-bold mb-8">Gestão de Pacotes</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(PACKAGES).map(([code, pkg]) => (
            <Card key={code} className="rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{packageStats[code] || 0}</p>
                    <p className="text-sm text-muted-foreground">{pkg.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          <Card className="rounded-2xl">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-500/10 rounded-2xl">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{packageStats.none || 0}</p>
                  <p className="text-sm text-muted-foreground">Sem pacote</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar talento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-full"
          />
        </div>

        {/* Talents Table */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Talentos e Pacotes</CardTitle>
            <CardDescription>Gerencie os pacotes de cada talento</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Talento</TableHead>
                  <TableHead>Pacote Atual</TableHead>
                  <TableHead>Data de Compra</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTalents.map((talent) => (
                  <TableRow key={talent.id}>
                    <TableCell className="font-medium">{talent.full_name}</TableCell>
                    <TableCell>
                      {talent.package ? (
                        <Badge className="bg-primary/10 text-primary">
                          {PACKAGES[talent.package.package_code]?.name}
                        </Badge>
                      ) : (
                        <Badge variant="outline">Nenhum</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {talent.package?.purchased_at
                        ? new Date(talent.package.purchased_at).toLocaleDateString("pt-BR")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={talent.package?.package_code || ""}
                        onValueChange={(value) => assignPackage(talent.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Atribuir pacote" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="start">START - R$ 100</SelectItem>
                          <SelectItem value="advanced">ADVANCED - R$ 197</SelectItem>
                          <SelectItem value="premium">PRO PREMIUM - R$ 297</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackagesManagement;
