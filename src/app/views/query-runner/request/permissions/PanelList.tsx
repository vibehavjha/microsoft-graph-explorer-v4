import {
  Announced,
  CheckboxVisibility,
  DetailsList,
  DetailsListLayoutMode,
  DetailsRow,
  GroupedList,
  GroupHeader,
  IColumn,
  IDetailsListCheckboxProps,
  IGroup,
  Label,
  PrimaryButton,
  SearchBox,
  SelectionMode,
  SelectionZone,
  Selection,
  ISelectionOptions,
  IObjectWithKey,
  ISelection
} from '@fluentui/react';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';

import { SortOrder } from '../../../../../types/enums';
import { IPermission } from '../../../../../types/permissions';
import { IRootState } from '../../../../../types/root';
import { dynamicSort } from '../../../../utils/dynamic-sort';
import { generateGroupsFromList } from '../../../../utils/generate-groups';
import { searchBoxStyles } from '../../../../utils/searchbox.styles';
import { setConsentedStatus } from './util';
import { useConst } from '@fluentui/react-hooks';

interface IPanelList {
  messages: any;
  columns: any[];
  classes: any;
  selection: any;
  renderItemColumn: any;
  renderDetailsHeader: Function;
  renderCustomCheckbox: Function;
}

const PanelList = ({ messages,
  columns, classes, selection,
  renderItemColumn, renderDetailsHeader, renderCustomCheckbox }: IPanelList) : JSX.Element => {

  const sortPermissions = (permissionsToSort: IPermission[]): IPermission[] => {
    return permissionsToSort ? permissionsToSort.sort(dynamicSort('value', SortOrder.ASC)) : [];
  }

  const { consentedScopes, scopes, authToken } = useSelector((state: IRootState) => state);
  const { fullPermissions } = scopes.data;
  const [permissions, setPermissions] = useState(sortPermissions(fullPermissions));
  const permissionsList : any[] = [];
  const tokenPresent = !!authToken.token;

  setConsentedStatus(tokenPresent, permissions, consentedScopes);

  permissions.forEach((perm: IPermission) => {
    const permission: any = { ...perm };
    const permissionValue = permission.value;
    const groupName = permissionValue.split('.')[0];
    permission.groupName = groupName;
    permissionsList.push(permission);
  });

  const searchValueChanged = (event: any, value?: string): void => {
    let filteredPermissions = scopes.data.fullPermissions;
    if (value) {
      const keyword = value.toLowerCase();

      filteredPermissions = fullPermissions.filter((permission: IPermission) => {
        const name = permission.value.toLowerCase();
        return name.includes(keyword);
      });
    }
    setPermissions(filteredPermissions);
  };

  const groups = generateGroupsFromList(permissionsList, 'groupName');

  const groupHeaderStyles = () => {
    return {
      check: { display: 'none' }
    }
  }

  const onRenderGroupHeader = (props: any): JSX.Element | null => {
    if (props) {
      return (
        <GroupHeader  {...props} styles={groupHeaderStyles}
        />
      )
    }
    return null;
  };

  const mySelection =  useConst(() => {
    const s = new Selection();
    // s.setItems(permissionsList, true);
    // const itttt = s.canSelectItem(item);
    const theItems = s.getItems();
    console.log(theItems);
    return s;
  });


  const onRenderCell = (nestingDepth?: number, item?: any, itemIndex?: number, group?: IGroup): React.ReactNode => {
    return (
      <DetailsRow
        columns={columns}
        groupNestingDepth={1}
        item={item}
        itemIndex={itemIndex!}
        selection={mySelection}
        selectionMode={SelectionMode.multiple}
        group={group}
      />
    )
  }

  return (
    <>
      <Label className={classes.permissionText}>
        <FormattedMessage id='Select different permissions' />
      </Label>
      <hr />
      <SearchBox
        className={classes.searchBox}
        placeholder={messages['Search permissions']}
        onChange={(event?: React.ChangeEvent<HTMLInputElement>, newValue?: string) =>
          searchValueChanged(event, newValue)}
        styles={searchBoxStyles}
      />
      <Announced message={`${permissions.length} search results available.`} />
      <hr />
      <GroupedList
        onRenderCell={onRenderCell}
        onShouldVirtualize={() => false}
        items={permissionsList}
        groups={groups}
        compact={true}
        groupProps={{
          showEmptyGroups: false,
          onRenderHeader: onRenderGroupHeader
        }}
      />
      {permissions && permissions.length === 0 &&
        <Label style={{
          display: 'flex',
          width: '100%',
          minHeight: '200px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <FormattedMessage id='permissions not found' />
        </Label>
      }
    </>
  );
};
export default PanelList;