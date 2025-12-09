import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PackageCode = "start" | "advanced" | "premium" | null;

export type PackageInfo = {
  code: PackageCode;
  name: string;
  price: string;
};

export const PACKAGES: Record<string, PackageInfo> = {
  start: { code: "start", name: "START", price: "R$ 100" },
  advanced: { code: "advanced", name: "ADVANCED", price: "R$ 197" },
  premium: { code: "premium", name: "PRO PREMIUM", price: "R$ 297" },
};

export const getPackageUpgrade = (currentPackage: PackageCode): PackageInfo | null => {
  if (!currentPackage) return PACKAGES.start;
  if (currentPackage === "start") return PACKAGES.advanced;
  if (currentPackage === "advanced") return PACKAGES.premium;
  return null;
};

export const usePackageAccess = () => {
  const [talentPackage, setTalentPackage] = useState<PackageCode>(null);
  const [accessibleCourseIds, setAccessibleCourseIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackageAccess();
  }, []);

  const loadPackageAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get talent's package
      const { data: packageData } = await supabase
        .from("talent_packages")
        .select("package_code")
        .eq("talent_id", user.id)
        .maybeSingle();

      const packageCode = (packageData?.package_code as PackageCode) || null;
      setTalentPackage(packageCode);

      // Get accessible course IDs based on package
      if (packageCode) {
        const { data: coursePackages } = await supabase
          .from("course_packages")
          .select("course_id")
          .eq("package_code", packageCode);

        if (coursePackages) {
          setAccessibleCourseIds(new Set(coursePackages.map(cp => cp.course_id)));
        }
      }
    } catch (error) {
      console.error("Error loading package access:", error);
    } finally {
      setLoading(false);
    }
  };

  const hasAccessToCourse = (courseId: string): boolean => {
    if (!talentPackage) return false;
    return accessibleCourseIds.has(courseId);
  };

  const getRequiredPackageForCourse = async (courseId: string): Promise<PackageInfo | null> => {
    // Find the minimum package that includes this course
    const { data } = await supabase
      .from("course_packages")
      .select("package_code")
      .eq("course_id", courseId)
      .order("package_code");

    if (data && data.length > 0) {
      // Return the minimum package (start < advanced < premium)
      const packageOrder = ["start", "advanced", "premium"];
      const sortedPackages = data.map(d => d.package_code).sort(
        (a, b) => packageOrder.indexOf(a) - packageOrder.indexOf(b)
      );
      return PACKAGES[sortedPackages[0]] || null;
    }
    return null;
  };

  return {
    talentPackage,
    accessibleCourseIds,
    loading,
    hasAccessToCourse,
    getRequiredPackageForCourse,
    refresh: loadPackageAccess,
  };
};
