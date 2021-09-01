/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  Card, Table, Button, Dropdown, Menu,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';
import intl from 'react-intl-universal';
import { filesColumns } from 'store/graphql/files/models';
import { getFilesData } from 'store/graphql/files/actions';
import Api from '../../../../../helpers/api';
import { TaskResponse } from '../../../../../helpers/search/types';
import MetadataModal from './metadataModal';
import ApolloProvider from '../../../../../store/providers/apollo';

import './styles.scss';

const fileInfo: {[key: string]: any} = require('./info.json');

const getURL = async (url: string) => {
  const data: any = await Api.getFileURL(url);
  return data.payload.data.url;
};

type FilesTabProps = {
  userToken: string;
};

const FilesTab: React.FC<FilesTabProps> = ({ userToken }) => {
  const { Patient } = fileInfo;

  const dataSource: any[] = [];
  const [isOpen, setIsOpenModal] = useState<boolean>(false);
  const [documentReference, setDocumentReference] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { loading: loadingData, results: rData } = getFilesData()();

  if (loadingData) {
    return null;
  }
  const getFileSize = (size: number) => {
    let newSize = size;
    if (size >= 1000 && size < 10 ** 6) {
      newSize = size / 1000;
      return `${newSize} ${intl.get('screen.patient.details.file.size.kb')}`;
    } if (size >= 10 ** 6 && size < 10 ** 9) {
      newSize = size / 10 ** 6;
      return `${newSize} ${intl.get('screen.patient.details.file.size.mb')}`;
    } if (size >= 10 ** 9 && size < 10 ** 12) {
      newSize = size / 10 ** 9;
      return `${newSize} ${intl.get('screen.patient.details.file.size.gb')}`;
    }

    return `${newSize} ${intl.get('screen.patient.details.file.size.b')}`;
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  const openUrl = (url: string) => {
    const tab = window.open('', '_blank');
    getURL(url).then((redirect) => {
      tab!.location.href = redirect;
    });
  };

  const getDropdownOption = (format: string, url: any, documentR: string) => {
    const option = [];

    option.push(
      (
        <Menu.Item>
          <Button
            type="link"
            className="link--underline"
            target="_blank"
            onClick={() => openUrl(url.file)}
          >
            { intl.get('screen.patient.details.file.download.file') }
          </Button>
        </Menu.Item>
      ),
      (
        <Menu.Item>
          <Button
            type="link"
            className="link--underline"
            onClick={() => {
              setDocumentReference(documentR);
              setIsOpenModal(true);
            }}
          >
            Metadata
          </Button>
        </Menu.Item>
      ),
    );
    if (format === 'CRAM' || format === 'VCF') {
      option.push(
        (
          <Menu.Item>
            <Button
              type="link"
              className="link--underline"
              target="_blank"
              onClick={() => openUrl(url.index)}
            >

              Index
            </Button>
          </Menu.Item>
        ),
      );
    }

    const menu = (
      <Menu>
        {
          option
        }
      </Menu>
    );

    return (
      <div>
        <Dropdown
          overlay={menu}
          className="files-tab__dropdownAction"
        >
          <Button type="link">
            { intl.get('screen.patient.details.file.download') } <DownOutlined />
          </Button>
        </Dropdown>

      </div>
    );
  };

  Patient.tasks.forEach((element: TaskResponse) => {
    const {
      format, title, size,
    } = element.output.resource.content[0];
    const { type } = element.output.resource;
    const prescription = element.resource.id.split('/')[1];
    const url = {
      file: element.output.resource.content[0].url,
      index: element.output.resource.content.length > 1 ? element.output.resource.content[1].url : null,
    };
    const date = element.runDate[0].split('T')[0];
    const documentR = JSON.stringify(element.output.resource, undefined, 4);
    const specimen = element.output.resource.specimen
      ? `${element.output.resource.specimen[0].external_id} / ${element.output.resource.specimen[0].organization.name}`
      : '--';
    const sizeWithUnity = getFileSize(Number(size));
    const data = {
      title,
      type,
      format,
      size: sizeWithUnity,
      sample: specimen,
      prescription,
      date,
      action: getDropdownOption(format, url, documentR),
    };

    dataSource.push(data);
  });

  return (
    <div className="page-static-content files-tab">
      <Card
        bordered={false}
      >
        <Table
          pagination={false}
          columns={filesColumns}
          dataSource={dataSource}
          size="small"
        />
      </Card>

      <MetadataModal
        open={isOpen}
        data={documentReference}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default FilesTab;
