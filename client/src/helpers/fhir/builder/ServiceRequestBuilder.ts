import { Coding, ServiceRequest } from '../types';
import {
  formatDate, getExtension, getPractitionerReference,
} from './Utils';
import { ExtensionUrls } from 'store/urls'
import { updateNoteComment, updateNoteStatus } from '../ServiceRequestNotesHelper';

const EXTENSION_SUBMITTED = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/is-submitted';
const EXTENSION_RESIDENT = 'http://fhir.cqgc.ferlab.bio/StructureDefinition/resident';

const defaultSR = (): Partial<ServiceRequest> => ({
  resourceType: 'ServiceRequest',
  status: 'draft',
  meta: {
    profile: ['http://fhir.cqgc.ferlab.bio/StructureDefinition/cqgc-service-request'],
  },
  extension: [
    {
      url: EXTENSION_SUBMITTED,
      valueBoolean: false,
    },
  ],
  intent: 'order',
  category: [
    {
      text: 'MedicalRequest',
    },
  ],
  priority: 'routine',
  authoredOn: formatDate(new Date()),
});

export class ServiceRequestBuilder {
    private serviceRequest: Partial<ServiceRequest> = defaultSR()

    constructor(serviceRequest: any) {
      if (serviceRequest != null) {
        this.serviceRequest = JSON.parse(JSON.stringify({
          ...this.serviceRequest,
          ...serviceRequest,
        }));
      }
    }

    public withId(id: string) {
      if (id != null) {
        this.serviceRequest.id = id;
      }
      return this;
    }

    public withMrn(mrn: string, organization: string) {
      if (mrn != null) {
        this.serviceRequest.identifier = [
          {
            type: {
              coding: [
                {
                  code: 'MR',
                  display: 'Medical record number',
                  system: 'http://terminology.hl7.org/CodeSystem/v2-0203',
                },
              ],
              text: 'Numéro du dossier médical',
            },
            value: mrn,
            assigner: {
              reference: `Organization/${organization}`,
            },
          }];
      }
      return this;
    }
  
    public withSupervisor(id?: string) {
      if (id) {
        const ext = getExtension(this.serviceRequest, ExtensionUrls.ResidentSupervisor);
        if (ext) {
          ext.valueReference = {
            reference: `Practitioner/${id}`,
          };
        } else {
          this.serviceRequest.extension?.push({
            url: ExtensionUrls.ResidentSupervisor,
            valueReference: {
              reference: `Practitioner/${id}`,
            },
          });
        }
      }
      return this;
    }

    public withSubmitted(value?: boolean) {
      const isSubmitted = value != null && value;
      const ext = getExtension(this.serviceRequest, EXTENSION_SUBMITTED);
      if (ext) {
        ext.valueBoolean = isSubmitted;
      } else {
        this.serviceRequest.extension?.push({
          url: EXTENSION_SUBMITTED,
          valueBoolean: isSubmitted,
        });
      }
      return this;
    }

    public withSubject(id: string) {
      this.serviceRequest.subject = {
        reference: `Patient/${id}`,
      };
      return this;
    }

    public withCoding(coding: Coding) {
      if (coding != null) {
        this.serviceRequest.code = {
          coding: [
            coding,
          ],
        };
      }
      return this;
    }

    public withRequester(id: string | null) {
      if (id != null) {
        this.serviceRequest.requester = getPractitionerReference(id);
      }
      return this;
    }

    public withAuthoredOn(date?: string) {
      if (date != null) {
        this.serviceRequest.authoredOn = date;
      }
      return this;
    }

    public withNote(note?: string) {
      if (note && note.length > 0) {
        this.serviceRequest.note = updateNoteComment({
          text: note,
          time: new Date().toISOString(),
        }, this.serviceRequest.note);
      }
      return this;
    }
  
    public withStatus(status?: string) {
      if (status) {
        this.serviceRequest.status = status
      }
      return this;
    }
  
    public withNoteStatus(note?: string, practitionerId?: string) {
      if (note && note.length > 0 && practitionerId) {
        this.serviceRequest.note = updateNoteStatus({
          authorReference: {
            reference: `Practitioner/${practitionerId}`,
          },
          text: note,
          time: new Date().toISOString(),
        }, this.serviceRequest.note);
      }
      return this;
    }
  
    public withProcedureDirectedBy(practitionerRoleId?: string) {
      if (practitionerRoleId) {
        const ext = getExtension(this.serviceRequest, ExtensionUrls.ProcedureDirectedBy);
        if (ext) {
          ext.valueReference = {
            reference: `PractitionerRole/${practitionerRoleId}`,
          };
        } else {
          this.serviceRequest.extension?.push({
            url: ExtensionUrls.ProcedureDirectedBy,
            valueReference: {
              reference: `PractitionerRole/${practitionerRoleId}`,
            },
          });
        }
      }
      return this;
    }
  
    public withPerformer(practitionerRoleId?: string) {
      if (practitionerRoleId) {
        this.serviceRequest.performer = [
          {
            reference: `PractitionerRole/${practitionerRoleId}`,
          },
        ]
      }
      return this;
    }

    public withResident(id?: string) {
      if (id != null) {
        const ext = getExtension(this.serviceRequest, EXTENSION_RESIDENT);
        if (ext) {
          ext.valueReference = {
            reference: `PractitionerRole/${id}`,
          };
        } else {
          this.serviceRequest.extension?.push({
            url: EXTENSION_RESIDENT,
            valueReference: {
              reference: `PractitionerRole/${id}`,
            },
          });
        }
      }
      return this;
    }

    public build() {
      return this.serviceRequest;
    }
}
