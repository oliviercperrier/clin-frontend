import {
  Button,
} from 'antd';
import React from 'react';
import intl from 'react-intl-universal';
import { useDispatch } from 'react-redux';
import { createCellRenderer } from '../../../Table/index';
import { navigateToPatientScreen } from '../../../../actions/router';

import InteractiveTable from '../../../Table/InteractiveTable';
import { PatientData } from '../../../../helpers/search/types';

interface Props {
  searchProps: any
  defaultVisibleColumns: string[]
  defaultColumnsOrder: { columnWidth: number, key: string, label: string }[]
  pageChangeCallback: (page: number, size: number) => void
  pageSizeChangeCallback: (size: number) => void
  exportCallback: () => void
  isLoading: boolean
  columnsUpdated: (columns: string[]) => void
  columnsOrderUpdated: (columns: any[]) => void
  columnsReset: () => void
  size:number
  page:number
}

const PatientTable: React.FC<Props> = ({
  searchProps,
  defaultVisibleColumns,
  defaultColumnsOrder,
  pageChangeCallback,
  pageSizeChangeCallback,
  exportCallback,
  isLoading,
  columnsUpdated,
  columnsOrderUpdated,
  columnsReset,
  page,
  size,
}) => {
  const dispatch = useDispatch();
  const { patient } = searchProps;
  const handleGoToPatientScreen:any = (patientId: string) => {
    dispatch(navigateToPatientScreen(patientId));
  };

  const results = patient.results.filter((result:any) => result != null && result.organization != null);
  const output: any[] = [];

  if (results) {
    results.forEach((result:PatientData) => {
      const organizationValue = () => {
        if (result.organization.name === '') {
          return result.organization.id.split('/')[1];
        }
        return result.organization.name;
      };
      const value:any = {
        status: '--',
        id: result.id,
        mrn: result.mrn,
        ramq: result.ramq,
        organization: organizationValue(),
        firstName: result.firstName,
        lastName: result.lastName.toUpperCase(),
        gender: intl.get(`screen.patientsearch.${result.gender.toLowerCase()}`),
        birthDate: result.birthDate,
        familyId: result.familyId,
        familyComposition: '',
        familyType: result.familyType,
        ethnicity: result.ethnicity,
        bloodRelationship: (result.bloodRelationship == null) ? '--' : result.bloodRelationship ? 'Yes' : 'No',
        position: result.position,
        practitioner: result.id.startsWith('PA') ? `${result.practitioner.lastName.toUpperCase()}, ${result.practitioner.firstName}` : 'FERRETTI, Vincent',
        request: result.requests,
        fetus: result.fetus,
      };

      Object.keys(value).forEach((key) => {
        if (value[key] == null || value[key].length === 0) {
          value[key] = '--';
        }
      });
      output.push(value);
    });
  }
  const columnPreset = [
    {
      key: 'patientId',
      label: 'screen.patientsearch.table.patientId',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data:any) => (
          <Button
            onClick={() => handleGoToPatientScreen(data.id)}
            data-id={data.request}
            className="button link--underline"
          >
            { data.id }
          </Button>
        ),
      }),
    },
    {
      key: 'organization',
      label: 'screen.patientsearch.table.organization',
      renderer: createCellRenderer('text', (() => output), { key: 'organization' }),
    },
    {
      key: 'lastName',
      label: 'screen.patientsearch.table.lastName',
      renderer: createCellRenderer('text', (() => output), { key: 'lastName' }),
    },
    {
      key: 'firstName',
      label: 'screen.patientsearch.table.firstName',
      renderer: createCellRenderer('custom', (() => output), {
        renderer: (data:any) => {
          try {
            const name = data.fetus ? intl.get('screen.patient.table.fetus') : data.firstName;
            return name;
          } catch (e) { return ''; }
        },
      }),
    },
    {
      key: 'gender',
      label: 'screen.patientsearch.table.gender',
      renderer: createCellRenderer('text', (() => output), { key: 'gender' }),
    },
    {
      key: 'dob',
      label: 'screen.patientsearch.table.dob',
      renderer: createCellRenderer('text', (() => output), { key: 'birthDate' }),
    },
    {
      key: 'practitioner',
      label: 'screen.patientsearch.table.practitioner',
      renderer: createCellRenderer('text', (() => output), { key: 'practitioner' }),
    },
    {
      key: 'mrn',
      label: 'screen.patientsearch.table.mrn',
      renderer: createCellRenderer('text', (() => output), { key: 'mrn' }),
    },
    {
      key: 'ramq',
      label: 'screen.patientsearch.table.ramq',
      renderer: createCellRenderer('text', (() => output), { key: 'ramq' }),
    },
    {
      key: 'position',
      label: 'screen.patientsearch.table.position',
      renderer: createCellRenderer('text', (() => output), { key: 'position' }),
    },
    {
      key: 'familyId',
      label: 'screen.patientsearch.table.familyId',
      renderer: createCellRenderer('text', (() => output), { key: 'familyId' }),
    },
    {
      key: 'familyType',
      label: 'screen.patientsearch.table.familyType',
      renderer: createCellRenderer('text', (() => output), { key: 'familyType' }),
    },
  ];
  return (
    <div className="bp3-table-header">
      <div className="bp3-table-column-name">
        <InteractiveTable
          key="patient-interactive-table"
          size={size}
          page={page}
          total={patient.total}
          totalLength={output.length}
          defaultVisibleColumns={defaultVisibleColumns}
          defaultColumnsOrder={defaultColumnsOrder}
          schema={columnPreset}
          pageChangeCallback={pageChangeCallback}
          pageSizeChangeCallback={pageSizeChangeCallback}
          exportCallback={exportCallback}
          numFrozenColumns={2}
          isLoading={isLoading}
          rowHeights={Array(patient.pageSize).fill(36)}
          columnsUpdated={columnsUpdated}
          columnsOrderUpdated={columnsOrderUpdated}
          columnsReset={columnsReset}
        />
      </div>
    </div>
  );
};

export default PatientTable;
