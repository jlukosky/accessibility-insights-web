// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ActionButton } from 'office-ui-fabric-react/lib/Button';
import * as React from 'react';

import { ContentActionMessageCreator } from '../../common/message-creators/content-action-message-creator';
import { NamedSFC } from '../../common/react/named-sfc';
import { ContentProvider, ContentReference } from './content-page';

export type ContentPanelButtonDeps = {
    contentProvider: ContentProvider;
    contentActionMessageCreator: ContentActionMessageCreator;
};

export type ContentPanelButtonProps = {
    deps: ContentPanelButtonDeps;
    reference: ContentReference;
    iconName: string;
};

export const ContentPanelButton = NamedSFC<ContentPanelButtonProps>('ContentPanelButton', ({ deps, reference, children, iconName }) => {
    const { contentProvider, contentActionMessageCreator } = deps;

    if (!reference) {
        return null;
    }

    const contentPath = contentProvider.pathFromReference(reference);
    const onClick = ev => contentActionMessageCreator.openContentPanel(ev, contentPath);

    return (
        <ActionButton iconProps={{ iconName }} onClick={onClick}>
            {children}
        </ActionButton>
    );
});
