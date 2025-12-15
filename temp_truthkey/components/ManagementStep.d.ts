import React from "react";
import { ManagementInfo } from "../types";
type Props = {
    value: ManagementInfo;
    onChange: (next: ManagementInfo) => void;
};
export declare function ManagementStep({ value, onChange }: Props): React.JSX.Element;
export {};
