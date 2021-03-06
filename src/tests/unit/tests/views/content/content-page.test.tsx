// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { mount } from 'enzyme';
import * as React from 'react';
import { Mock } from 'typemoq';
import { NewTabLink } from '../../../../../common/components/new-tab-link';
import { ContentCreator, ContentPage, ContentPageDeps, linkTo } from '../../../../../views/content/content-page';
import { shallowRender } from '../../../common/shallow-render';

describe('ContentPage', () => {
    const deps = Mock.ofType<ContentPageDeps>().object;

    describe('.create', () => {
        it('renders', () => {
            const MyPage = ContentPage.create(({ Markup, Link }) => {
                return <>MY CONTENT</>;
            });

            const result = shallowRender(<MyPage deps={deps} />);
            expect(result.props.children).toEqual('MY CONTENT');
        });

        it('passes options through to Markup', () => {
            const MyPage = ContentPage.create(({ Markup }) => {
                return <>{(Markup as any).options.testString}</>;
            });

            const result = shallowRender(<MyPage deps={deps} options={{ setPageTitle: true, testString: 'TEST STRING' }} />);
            expect(result.props.children).toEqual('TEST STRING');
        });
    });

    describe('.provider', () => {
        const thePage = ContentPage.create(() => <>THE PAGE</>);
        const z = ContentPage.create(() => <>X-Y-Z</>);
        const notInTree = ContentPage.create(() => <>NOT IN TREE</>);

        const tree = {
            forest: {
                thePage,
            },
            x: {
                y: {
                    z,
                },
            },
        };

        const provider = ContentPage.provider(tree);

        it('returns allPaths', () => {
            expect(provider.allPaths()).toEqual(['forest/thePage', 'x/y/z']);
        });

        it('returns pathTo forest/thePage', () => {
            expect(provider.pathTo(thePage)).toEqual('forest/thePage');
        });

        it('returns pathTo x/y/z', () => {
            expect(provider.pathTo(z)).toEqual('x/y/z');
        });

        it('returns null for pathTo page not in the tree', () => {
            expect(provider.pathTo(notInTree)).toBeNull();
        });

        it('finds forest/thePage', () => {
            const MyPage = provider.getPage('forest/thePage');
            const result = shallowRender(<MyPage deps={deps} />);
            expect(result.props.children).toEqual('THE PAGE');
        });

        ['forest', 'notForest/thePage', 'forest/notThePage', 'extraPath/forest/thePage', 'thePage'].forEach(page =>
            it(`doesn't find ${page}`, () => {
                const MyPage = provider.getPage(page);
                expect(MyPage.displayName).toEqual('ContentPageComponent');
                const result = shallowRender(<MyPage deps={deps} />);
                expect(result.props.children).toEqual(['Cannot find ', page]);
            }),
        );
    });

    describe('ContentCreator links', () => {
        const linksMap = {
            testLink: linkTo('text', 'href'),
        };

        const create = ContentCreator(linksMap);

        it('renders', () => {
            const MyPage = create(({ Link }) => <Link.testLink />);

            const wrapped = mount(<MyPage deps={deps} />);

            const link = wrapped.find(NewTabLink);

            expect(link.getElement()).toMatchSnapshot();
        });

        it('renders, children is text', () => {
            const MyPage = create(({ Link }) => <Link.testLink>OVERRIDE</Link.testLink>);

            const wrapped = mount(<MyPage deps={deps} />);

            const link = wrapped.find(NewTabLink);

            expect(link.getElement()).toMatchSnapshot();
        });
    });
});
