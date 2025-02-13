import {
  DetailsList, DetailsListLayoutMode, getTheme, IColumn,
  Label, Link, SelectionMode, TooltipHost
} from '@fluentui/react';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';

import { AppDispatch, useAppSelector } from '../../../../../store';
import { IPermission, IPermissionProps } from '../../../../../types/permissions';
import { fetchAllPrincipalGrants, fetchScopes } from '../../../../services/actions/permissions-action-creator';
import { usePopups } from '../../../../services/hooks';
import { translateMessage } from '../../../../utils/translate-messages';
import { classNames } from '../../../classnames';
import { permissionStyles } from './Permission.styles';
import PermissionItem from './PermissionItem';
import { getColumns } from './columns';
import { setConsentedStatus } from './util';
import { convertVhToPx } from '../../../common/dimensions/dimensions-adjustment';

export const Permissions = (permissionProps?: IPermissionProps): JSX.Element => {
  const dispatch: AppDispatch = useDispatch();
  const { sampleQuery, scopes, authToken, consentedScopes, dimensions } =
    useAppSelector((state) => state);
  const { show: showPermissions } = usePopups('full-permissions', 'panel');

  const tokenPresent = !!authToken.token;
  const { pending: loading, error } = scopes;
  const permissions: IPermission[] = scopes.data.specificPermissions ? scopes.data.specificPermissions : [];
  const [isScreenSizeReduced, setIsScreenSizeReduced] = useState(false);
  const [permissionsError, setPermissionsError] = useState(error);

  useEffect(() => {
    if(error?.error && error?.error?.url.contains('permissions')){
      setPermissionsError(error?.error);
    }
  }, [error])

  const classProps = {
    styles: permissionProps!.styles,
    theme: permissionProps!.theme
  };

  const classes = classNames(classProps);
  const theme = getTheme();
  const { tooltipStyles, detailsHeaderStyles } = permissionStyles(theme);
  const tabHeight =  convertVhToPx(dimensions.request.height, 110);

  setConsentedStatus(tokenPresent, permissions, consentedScopes);

  const permissionsTabStyles = {
    root: {
      padding: '17px'
    }
  }

  const openPermissionsPanel = () => {
    showPermissions({
      settings: {
        title: translateMessage('Permissions'),
        width: 'lg'
      }
    })
  }

  const getPermissions = (): void => {
    dispatch(fetchScopes('query'));
    fetchPermissionGrants();
  }

  const fetchPermissionGrants = (): void => {
    if (tokenPresent) {
      dispatch(fetchAllPrincipalGrants());
    }
  }

  useEffect(() => {
    getPermissions();
  }, [sampleQuery]);

  useEffect(() => {
    setConsentedStatus(tokenPresent, permissions, consentedScopes);
  }, [consentedScopes]);

  useEffect(() => {
    if (tokenPresent) {
      dispatch(fetchAllPrincipalGrants());
    }
  }, []);

  const renderDetailsHeader = (props: any, defaultRender?: any): JSX.Element => {
    return defaultRender({
      ...props,
      onRenderColumnHeaderTooltip: (tooltipHostProps: any) => {
        return (
          <TooltipHost {...tooltipHostProps} styles={tooltipStyles} />
        );
      },
      styles: detailsHeaderStyles
    });
  }

  if (loading.isSpecificPermissions) {
    return (
      <Label style={{ marginLeft: '12px' }}>
        <FormattedMessage id={'Fetching permissions'} />...
      </Label>
    );
  }

  const displayNoPermissionsFoundMessage = (): JSX.Element => {
    return (
      <Label styles={permissionsTabStyles}>
        <FormattedMessage id='permissions not found in permissions tab' />
        <Link underline onClick={openPermissionsPanel}>
          <FormattedMessage id='open permissions panel' />
        </Link>
        <FormattedMessage id='permissions list' />
      </Label>);
  }

  const displayNotSignedInMessage = (): JSX.Element => {
    return (
      <Label styles={permissionsTabStyles}>
        <FormattedMessage id='sign in to view a list of all permissions' />
      </Label>)
  }

  const displayErrorFetchingPermissionsMessage = () : JSX.Element => {
    return (<Label className={classes.permissionLabel}>
      <FormattedMessage id='Fetching permissions failing' />
    </Label>);
  }

  if (!tokenPresent && permissions.length === 0) {
    return displayNotSignedInMessage();
  }

  if (permissions.length === 0) {
    return permissionsError?.status && (permissionsError?.status === 404 || permissionsError?.status === 400)
      ? displayNoPermissionsFoundMessage() :
      displayErrorFetchingPermissionsMessage();
  }

  return (
    <div >
      <Label className={classes.permissionLength} style={{ paddingLeft: '12px' }}>
        <FormattedMessage id='Permissions' />
      </Label>
      <Label className={classes.permissionText} style={{ paddingLeft: '12px' }}>
        {!tokenPresent && <FormattedMessage id='sign in to consent to permissions' />}
        {tokenPresent && <FormattedMessage id='permissions required to run the query' />}
      </Label>
      <div
        onMouseEnter={() => {

          if (screen.width < 1260 || window.innerWidth < 1290) {
            setIsScreenSizeReduced(true);
          }
        }
        }
        onMouseLeave={() => setIsScreenSizeReduced(false)}
        style={{ flex: 1 }}
      >
        <DetailsList
          styles={!isScreenSizeReduced ? {
            root:
              { height: tabHeight, overflowX: 'hidden', overflowY: 'auto' }
          } : { root: { height: tabHeight, overflowY: 'auto' } }}
          items={permissions}
          columns={getColumns('tab', tokenPresent)}
          onRenderItemColumn={(item?: any, index?: number, column?: IColumn) => {
            return <PermissionItem column={column} index={index} item={item} />
          }}
          selectionMode={SelectionMode.none}
          layoutMode={DetailsListLayoutMode.justified}
          onRenderDetailsHeader={(props?: any, defaultRender?: any) => renderDetailsHeader(props, defaultRender)} />
      </div>
    </div>
  );
}