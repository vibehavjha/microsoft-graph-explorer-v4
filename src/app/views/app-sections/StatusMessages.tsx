import { Link, MessageBar } from '@fluentui/react';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch } from 'react-redux';

import { IQuery } from '../../../types/query-runner';
import { AppDispatch, useAppSelector } from '../../../store';
import { setSampleQuery } from '../../services/actions/query-input-action-creators';
import { clearQueryStatus } from '../../services/actions/query-status-action-creator';
import { GRAPH_URL } from '../../services/graph-constants';
import {
  convertArrayToObject, extractUrl, getMatchesAndParts,
  matchIncludesLink, replaceLinks
} from '../../utils/status-message';

const StatusMessages = () => {
  const dispatch: AppDispatch = useDispatch();
  const { queryRunnerStatus, sampleQuery } =
    useAppSelector((state) => state);

  function displayStatusMessage(message: string, urls: any) {
    const { matches, parts } = getMatchesAndParts(message);

    if (!parts || !matches || !urls || Object.keys(urls).length === 0) {
      return message;
    }

    return parts.map((part: string, index: number) => {
      const includesLink = matchIncludesLink(matches, part);
      const displayLink = (): React.ReactNode => {
        const link = urls[part];
        if (link) {
          if (link.includes(GRAPH_URL)) {
            return <Link onClick={() => setQuery(link)} underline>{link}</Link>;
          }
          return <Link target="_blank" href={link} underline>{link}</Link>;
        }
      };
      return (
        <Fragment key={part + index}>{includesLink ?
          displayLink() : part}
        </Fragment>
      );
    })
  }

  function setQuery(link: string) {
    const query: IQuery = { ...sampleQuery };
    link = link.replace(/\.$/, '');
    query.sampleUrl = link;
    query.selectedVerb = 'GET';
    dispatch(setSampleQuery(query));
  }

  if (queryRunnerStatus) {
    const { messageType, statusText, status, duration, hint } = queryRunnerStatus;
    let urls: any = {};
    let message = status.toString();
    const extractedUrls = extractUrl(status.toString());
    if (extractedUrls) {
      message = replaceLinks(status.toString());
      urls = convertArrayToObject(extractedUrls);
    }

    return <MessageBar messageBarType={messageType}
      isMultiline={true}
      onDismiss={() => dispatch(clearQueryStatus())}
      dismissButtonAriaLabel='Close'
      aria-live={'assertive'}>
      {`${statusText} - `}{displayStatusMessage(message, urls)}

      {duration && <>
        {` - ${duration}`}<FormattedMessage id='milliseconds' />
      </>}

      {status === 403 && <>.
        <FormattedMessage id='consent to scopes' />
        <span style={{ fontWeight: 600 }}>
          <FormattedMessage id='modify permissions' />
        </span>
        <FormattedMessage id='tab' />
      </>}

      {hint && <div>{hint}</div>}

    </MessageBar>;
  }
  return <div />;
}

export default StatusMessages;
