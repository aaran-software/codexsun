import React from 'react';
import {Outlet} from 'react-router-dom';
import {TopMenu} from "../menu/app/top-menu";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "../ui/sidebar";
import {AppSidebar} from "../menu/sidebar/app-sidebar";
import {Separator} from "radix-ui";
import { useAuth } from '../../global/auth/AuthContext';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "../ui/breadcrumb";
import Loader from "../../components/loader/loader";
import BreadcrumbsWithIcon from '../blocks/BreadcrumbItem';

const AppLayout: React.FC = () => {
    const { loading } = useAuth();
    if (loading) {
        return <Loader />;
    }

    return (
        <div>

            {/* Full-width top menu with dark background */}
            <TopMenu />

            <SidebarProvider>
                <AppSidebar/>
                <SidebarInset>
                    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem className="hidden md:block">
                                    <BreadcrumbLink href="#">
                                        Home

                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="hidden md:block" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                      {/*<BreadcrumbsWithIcon>*/}
                      {/*              /!*<BreadcrumbLink href="#">*!/*/}
                      {/*              /!*    Building Your Application*!/*/}

                      {/*              /!*</BreadcrumbLink>*!/*/}
                      {/*</BreadcrumbsWithIcon>*/}




                    </header>
                    <main className="flex-1 p-3 overflow-auto">
                        <Outlet />
                    </main>
                </SidebarInset>

            </SidebarProvider>


        </div>
    )
}
export default AppLayout;