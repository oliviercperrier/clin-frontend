/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/jsx-boolean-value */
/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import intl from 'react-intl-universal';
import SidebarMenu, { ISidebarMenuItem } from '@ferlab/ui/core/components/sidebarMenu';
import { useFilters } from '@ferlab/ui/core/data/filters/utils';
import QueryBuilder from '@ferlab/ui/core/components/QueryBuilder';
import { IDictionary } from '@ferlab/ui/core/components/QueryBuilder/types';
import ScrollView from '@ferlab/ui/core/layout/ScrollView';
import StackLayout from '@ferlab/ui/core/layout/StackLayout';
import LineStyleIcon from 'components/icons/LineStyleIcon';
import GeneIcon from 'components/icons/GeneIcon';
import DiseaseIcon from 'components/icons/DiseaseIcon';
import FrequencyIcon from 'components/icons/FrequencyIcon';
import OccurenceIcon from 'components/icons/OccurenceIcon';
import VariantTableContainer from './VariantTableContainer';
import VariantFilter from './filters/VariantFilters';
import GeneFilters from './filters/GeneFilters';
import MetricFilters from './filters/MetricFilters';
import FrequencyFilter from './filters/FrequencyFilter';
import ImpactFilters from './filters/ImpactFilters';

import styles from './PatientVariant.module.scss';

const DEFAULT_PAGE_NUM = 1;

const PatientVariantScreen = () => {
  const [currentPageNum, setCurrentPageNum] = useState(DEFAULT_PAGE_NUM);
  const { filters } = useFilters();
  const dictionary: IDictionary = {
    query: {
      combine: {
        and: intl.get('querybuilder.query.combine.and'),
        or: intl.get('querybuilder.query.combine.or'),
      },
      noQuery: intl.get('querybuilder.query.noQuery'),
      facet: (field: string) => field,
    },
    actions: {
      new: intl.get('querybuilder.actions.new'),
      addQuery: intl.get('querybuilder.actions.addQuery'),
      combine: intl.get('querybuilder.actions.combine'),
      labels: intl.get('querybuilder.actions.labels'),
      changeOperatorTo: intl.get('querybuilder.actions.changeOperatorTo'),
      delete: {
        title: intl.get('querybuilder.actions.delete.title'),
        cancel: intl.get('querybuilder.actions.delete.cancel'),
        confirm: intl.get('querybuilder.actions.delete.confirm'),
      },
      clear: {
        title: intl.get('querybuilder.actions.clear.title'),
        cancel: intl.get('querybuilder.actions.clear.cancel'),
        confirm: intl.get('querybuilder.actions.clear.confirm'),
        buttonTitle: intl.get('querybuilder.actions.clear.buttonTitle'),
        description: intl.get('querybuilder.actions.clear.description'),
      },
    },
  };
  const results = {
    loading: false,
    total: 0,
  };
  const { total } = results;

  const menuItems: ISidebarMenuItem[] = [
    {
      key: '1',
      title: intl.get('screen.patientvariant.category_variant'),
      icon: <LineStyleIcon />,
      panelContent: <VariantFilter />,
    },
    {
      key: '2',
      title: intl.get('screen.patientvariant.category_genomic'),
      icon: <GeneIcon />,
      panelContent: <GeneFilters />,
    },
    {
      key: '3',
      title: intl.get('screen.patientvariant.category_impacts'),
      icon: <DiseaseIcon />,
      panelContent: <ImpactFilters />,
    },
    {
      key: '4',
      title: intl.get('screen.patientvariant.category_cohort'),
      icon: <FrequencyIcon />,
      panelContent: <FrequencyFilter />,
    },
    {
      key: '5',
      title: intl.get('screen.patientvariant.category_metric'),
      icon: <OccurenceIcon />,
      panelContent: <MetricFilters />,
    },
  ];

  return (
    <div className={styles.patientVariantLayout}>
      <SidebarMenu className={styles.patientVariantSidebar} menuItems={menuItems} />
      <ScrollView className={styles.scrollContent}>
        <StackLayout vertical className={styles.pageContainer}>
          <QueryBuilder
            className="variant-repo__query-builder"
            showHeader={true}
            headerTitle="Variant Query"
            showHeaderTools={false}
            cacheKey="patient-variant-repo"
            enableCombine={false}
            currentQuery={filters?.content?.length ? filters : {}}
            loading={results.loading}
            total={total}
            dictionary={dictionary}
          />
          <VariantTableContainer setCurrentPageCb={setCurrentPageNum} />
        </StackLayout>
      </ScrollView>
    </div>
  );
};

export default PatientVariantScreen;
