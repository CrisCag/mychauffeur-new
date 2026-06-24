import nodemailer from "nodemailer";
import type { StoredBookingRequest } from "@/lib/booking-requests";

function isSmtpConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.BOOKING_FROM_EMAIL
  );
}

export async function sendBookingEmail(
  request: StoredBookingRequest
): Promise<boolean> {
  if (!isSmtpConfigured()) return false;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const vehicleLabel =
    request.vehicleType === "sedan"
      ? "Berlina/Sedan"
      : request.vehicleType === "van"
        ? "Van"
        : `Altro (${request.vehicleOtherDetails ?? "non specificato"})`;

  const subjectPrefix = request.inquiryType === "b2b" ? "[B2B]" : "[BOOKING]";
  const subject = `${subjectPrefix} Nuova richiesta #${request.id.slice(0, 8)}`;

  const text = [
    `Nuova richiesta da sito MyChauffeur.it`,
    ``,
    `ID: ${request.id}`,
    `Data creazione: ${request.createdAt}`,
    `Lingua: ${request.locale ?? "it"}`,
    `Tipo richiesta: ${request.inquiryType ?? "standard"}`,
    ``,
    `Partenza: ${request.pickupLocation}`,
    `Destinazione: ${request.dropoffLocation}`,
    `Data corsa: ${request.rideDate}`,
    `Ora corsa: ${request.rideTime}`,
    `Passeggeri: ${request.passengers}`,
    `Veicolo: ${vehicleLabel}`,
    request.quotedPrice != null
      ? `Prezzo indicativo: ${request.quoteCurrency ?? "EUR"} ${request.quotedPrice}`
      : "",
    request.distanceKm != null ? `Distanza stimata: ${request.distanceKm} km` : "",
    request.durationMinutes != null
      ? `Durata stimata: ${request.durationMinutes} min`
      : "",
    request.quoteId ? `Quote ID: ${request.quoteId}` : "",
    request.addReturn && request.returnDate
      ? `Ritorno: ${request.returnDate}${request.returnTime ? ` ${request.returnTime}` : ""}`
      : "",
    request.bookingMode === "round_trip" ? "Tipo: andata e ritorno" : "",
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: process.env.BOOKING_FROM_EMAIL,
    to: request.destinationEmail,
    subject,
    text,
  });

  return true;
}
