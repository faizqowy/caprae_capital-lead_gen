import type { Lead } from "@/types";

export function exportToCsv(leads: Lead[], filename: string) {
  const headers = [
    "Company",
    "Website",
    "Industry",
    "Product/Service Category",
    "Business Type",
    "Employees Count",
    "Revenue",
    "Year Founded",
    "BBB Rating",
    "Street",
    "City",
    "State",
    "Company Phone",
    "Company LinkedIn",
    "Owner's First Name",
    "Owner's Last Name",
    "Owner's Title",
    "Owner's LinkedIn",
    "Owner's Phone Number",
    "Owner's Email",
    "Source",
    "Created Date",
    "Updated Date",
    "Score",
    "Score Reason",
  ];

  const csvContent = [
    headers.join(","),
    ...leads.map((lead) =>
      [
        lead.companyName,
        lead.website,
        lead.industry,
        lead.productServiceCategory,
        lead.businessType,
        lead.employeesCount,
        lead.revenue,
        lead.yearFounded,
        lead.bbbRating,
        lead.street,
        lead.city,
        lead.state,
        lead.companyPhone,
        lead.companyLinkedIn,
        lead.ownerFirstName,
        lead.ownerLastName,
        lead.ownerTitle,
        lead.ownerLinkedIn,
        lead.ownerPhoneNumber,
        lead.ownerEmail,
        lead.source,
        lead.createdDate,
        lead.updatedDate,
        lead.score,
        lead.scoreReason,
      ]
        .map((field) => {
          const str = field === null || field === undefined ? "" : String(field);
          if (str.includes('"') || str.includes(",") || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.href) {
    URL.revokeObjectURL(link.href);
  }
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
