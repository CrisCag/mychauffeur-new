import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type BookingRequestInput = {
  pickupLocation: string;
  dropoffLocation: string;
  rideDate: string;
  rideTime: string;
  passengers: string;
  vehicleType: "sedan" | "van" | "other";
  vehicleOtherDetails?: string;
  locale?: string;
  inquiryType?: "standard" | "b2b";
  destinationEmail?: string;
  quotedPrice?: number;
  quoteCurrency?: string;
  distanceKm?: number;
  durationMinutes?: number;
  quoteId?: string | null;
  addReturn?: boolean;
  returnDate?: string;
  returnTime?: string;
  bookingMode?: "one_way" | "round_trip";
};

export type StoredBookingRequest = BookingRequestInput & {
  id: string;
  createdAt: string;
};

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "booking-requests.json");

async function readRequests(): Promise<StoredBookingRequest[]> {
  try {
    const raw = await readFile(dataFilePath, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export async function saveBookingRequest(
  request: BookingRequestInput
): Promise<StoredBookingRequest> {
  const requests = await readRequests();
  const nextRequest: StoredBookingRequest = {
    ...request,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };

  requests.push(nextRequest);
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFilePath, JSON.stringify(requests, null, 2), "utf8");

  return nextRequest;
}
