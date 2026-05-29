import fs from 'fs';
import path from 'path';

import { RESIDENTS, Resident } from '../data/residents';

const EVENT_NAME = 'Le Club MSQ 26 – Internet Brunch IRL';
const EVENT_URL = 'https://connect.msqpartners.com/internet-brunch-irl';
const PORTAL_ID = '144458568';
const FORM_ID = '0ef86132-e6ba-413b-abfe-6c2983d09f09';
const ENDPOINT = `https://api-eu1.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_ID}`;

const REGISTRATIONS_JSON = path.resolve(__dirname, '../data/event-registrations.json');
const REGISTRATIONS_CSV = path.resolve(__dirname, '../data/residents-registrations-detailed.csv');
const TODAY = new Date().toISOString().slice(0, 10);

type RegistrationStatus = 'success' | 'failed';

interface SubmissionResult {
  resident: Resident;
  status: RegistrationStatus;
  responseBody: string;
}

function fullName(resident: Resident): string {
  return `${resident.firstName} ${resident.lastName}`;
}

function buildPayload(resident: Resident) {
  return {
    submittedAt: Date.now(),
    fields: [
      { name: 'firstname', value: resident.firstName },
      { name: 'lastname', value: resident.lastName },
      { name: 'email', value: resident.email },
      { name: 'company', value: resident.company },
      { name: 'jobtitle', value: resident.jobTitle },
      { name: 'cannes_2026_internet_brunch__registered', value: 'yes' },
      { name: 'cannes_2026_msq_internet_brunch_status', value: 'Interested' },
    ],
    context: {
      pageUri: EVENT_URL,
      pageName: EVENT_NAME,
    },
    legalConsentOptions: {
      legitimateInterest: {
        value: true,
        subscriptionTypeId: 347323195,
        legalBasis: 'CUSTOMER',
        text: 'Resident registration submitted by Indvstry Clvb.',
      },
    },
  };
}

async function submitResident(resident: Resident): Promise<SubmissionResult> {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(buildPayload(resident)),
  });

  const responseBody = await response.text();
  return {
    resident,
    status: response.ok ? 'success' : 'failed',
    responseBody,
  };
}

function updateJsonLog(results: SubmissionResult[]): void {
  const raw = fs.readFileSync(REGISTRATIONS_JSON, 'utf8');
  const parsed = JSON.parse(raw);
  const events = Array.isArray(parsed.events) ? parsed.events : [];

  let eventEntry = events.find((event: any) => event.eventUrl === EVENT_URL);
  if (!eventEntry) {
    eventEntry = {
      eventName: EVENT_NAME,
      eventUrl: EVENT_URL,
      addedDate: TODAY,
      registrations: {},
    };
    events.push(eventEntry);
  }

  eventEntry.eventName = EVENT_NAME;
  eventEntry.eventUrl = EVENT_URL;
  eventEntry.addedDate ||= TODAY;
  eventEntry.registrations ||= {};

  for (const result of results) {
    eventEntry.registrations[fullName(result.resident)] = {
      status: result.status,
      date: TODAY,
    };
  }

  parsed.events = events;
  fs.writeFileSync(REGISTRATIONS_JSON, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8');
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function appendCsvLog(results: SubmissionResult[]): void {
  const lines = results.map(({ resident, status }) => [
    fullName(resident),
    resident.firstName,
    resident.lastName,
    resident.email,
    resident.company,
    resident.jobTitle,
    resident.location,
    resident.phone,
    resident.linkedinUrl,
    resident.website || '',
    EVENT_NAME,
    EVENT_URL,
    status,
    TODAY,
  ].map(value => csvEscape(value)).join(','));

  fs.appendFileSync(REGISTRATIONS_CSV, `${lines.join('\n')}\n`, 'utf8');
}

async function main(): Promise<void> {
  const results: SubmissionResult[] = [];

  for (const resident of RESIDENTS) {
    process.stdout.write(`Submitting ${fullName(resident)} <${resident.email}> ... `);
    try {
      const result = await submitResident(resident);
      results.push(result);
      console.log(result.status.toUpperCase());
      if (result.status === 'failed') {
        console.log(result.responseBody);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({ resident, status: 'failed', responseBody: message });
      console.log('FAILED');
      console.log(message);
    }
  }

  updateJsonLog(results);
  appendCsvLog(results);

  const successCount = results.filter(result => result.status === 'success').length;
  const failedCount = results.length - successCount;
  console.log(`\nCompleted ${results.length} submissions: ${successCount} success, ${failedCount} failed.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
