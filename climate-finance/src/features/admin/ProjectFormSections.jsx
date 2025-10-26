import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckboxGroup from "../../components/ui/CheckboxGroup";
import RadioWithSliders from "../../components/ui/RadioWithSliders";
import SingleSlider from "../../components/ui/SingleSlider";
import { sdgList } from "../../constants/sdgList";

const ProjectFormSections = ({
    formData,
    handleInputChange,
    handleMultiSelectChange,
    handleWashComponentChange,
    agencies,
    fundingSources,
}) => {
    const navigate = useNavigate();
    const [districtsData, setDistrictsData] = useState({});
    const [availableDistricts, setAvailableDistricts] = useState([]);

    // Load districts data
    useEffect(() => {
        fetch("/bd-districts.json")
            .then((res) => res.json())
            .then((data) => {
                setDistrictsData(data);
                // Initially show all districts
                const allDistricts = Object.values(data)
                    .flat()
                    .map((name, index) => ({
                        id: index + 1,
                        name: name,
                    }));
                setAvailableDistricts(allDistricts);
            })
            .catch((err) => console.error("Error loading districts:", err));
    }, []);

    // Filter districts based on selected geographic division
    useEffect(() => {
        if (
            formData.geographic_division &&
            districtsData[formData.geographic_division]
        ) {
            const filteredDistricts = districtsData[
                formData.geographic_division
            ].map((name, index) => ({
                id: index + 1,
                name: name,
            }));
            setAvailableDistricts(filteredDistricts);
            // Clear selected districts if they're not in the filtered list
            const validDistrictNames = filteredDistricts.map((d) => d.name);
            const validSelectedDistricts = formData.districts.filter(
                (districtName) => validDistrictNames.includes(districtName)
            );
            if (validSelectedDistricts.length !== formData.districts.length) {
                handleMultiSelectChange(
                    { target: { value: validSelectedDistricts } },
                    "districts"
                );
            }
        } else {
            // If no division selected, show all districts
            const allDistricts = Object.values(districtsData)
                .flat()
                .map((name, index) => ({
                    id: index + 1,
                    name: name,
                }));
            setAvailableDistricts(allDistricts);
        }
    }, [
        formData.geographic_division,
        districtsData,
        formData.districts,
        handleMultiSelectChange,
    ]);

    const handleWashSliderChange = (value) => {
        handleWashComponentChange((prev) => ({
            ...prev,
            wash_percentage: value,
        }));
    };

    const handleWashDescriptionChange = (description) => {
        handleWashComponentChange((prev) => ({
            ...prev,
            description: description,
        }));
    };

    const handleAddAgency = () => {
        localStorage.setItem("projectFormData", JSON.stringify(formData));
        navigate("/admin/agencies/new");
    };

    const handleAddFundingSource = () => {
        localStorage.setItem("projectFormData", JSON.stringify(formData));
        navigate("/admin/funding-sources/new");
    };

    return (
        <>
            {/* Agencies */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Implementing & Executing Agencies
                </h3>
                <CheckboxGroup
                    label="Select Agencies"
                    options={agencies}
                    selectedValues={formData.agencies}
                    onChange={(values) =>
                        handleMultiSelectChange(
                            { target: { value: values } },
                            "agencies"
                        )
                    }
                    getOptionId={(agency) => agency.agency_id}
                    getOptionLabel={(agency) => agency.name}
                    getOptionSubtext={(agency) => agency.type}
                    onAddNew={handleAddAgency}
                    addButtonText="Add Agency"
                />
            </div>

            {/* Funding Sources */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Funding Sources
                </h3>
                <CheckboxGroup
                    label="Select Funding Sources"
                    options={fundingSources}
                    selectedValues={formData.funding_sources}
                    onChange={(values) =>
                        handleMultiSelectChange(
                            { target: { value: values } },
                            "funding_sources"
                        )
                    }
                    getOptionId={(source) => source.funding_source_id}
                    getOptionLabel={(source) => source.name}
                    getOptionSubtext={(source) =>
                        `Development Partner: ${source.dev_partner}`
                    }
                    onAddNew={handleAddFundingSource}
                    addButtonText="Add Funding Source"
                />
            </div>

            {/* Geographic Location */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Geographic Location
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Division <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="geographic_division"
                            value={formData.geographic_division}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select Division</option>
                            {Object.keys(districtsData).map((division) => (
                                <option key={division} value={division}>
                                    {division}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Districts <span className="text-red-500">*</span>
                        </label>
                        <CheckboxGroup
                            label="Select Districts"
                            options={availableDistricts}
                            selectedValues={formData.districts}
                            onChange={(values) =>
                                handleMultiSelectChange(
                                    { target: { value: values } },
                                    "districts"
                                )
                            }
                            getOptionId={(district) => district.name}
                            getOptionLabel={(district) => district.name}
                        />
                    </div>
                </div>
            </div>

            {/* WASH Component - Updated */}
            <div>
                <SingleSlider
                    label="WASH Component"
                    value={formData.wash_component?.wash_percentage || 0}
                    onChange={handleWashSliderChange}
                    description={formData.wash_component?.description || ""}
                    onDescriptionChange={handleWashDescriptionChange}
                />
            </div>

            {/* Hotspot/Vulnerability Type */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Hotspot/Vulnerability Type
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hotspot/Vulnerability Type
                        </label>
                        <input
                            type="text"
                            name="hotspot_vulnerability_type"
                            value={formData.hotspot_vulnerability_type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Beneficiaries - Updated */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Beneficiaries
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Direct Beneficiaries
                            </label>
                            <input
                                type="number"
                                name="direct_beneficiaries"
                                value={formData.direct_beneficiaries}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                min="0"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Indirect Beneficiaries
                            </label>
                            <input
                                type="number"
                                name="indirect_beneficiaries"
                                value={formData.indirect_beneficiaries}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                min="0"
                            />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Beneficiary Description
                        </label>
                        <textarea
                            name="beneficiary_description"
                            value={formData.beneficiary_description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Gender & Inclusion */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Gender & Inclusion
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gender & Inclusion
                        </label>
                        <textarea
                            name="gender_inclusion"
                            value={formData.gender_inclusion}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Equity Marker */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Equity Marker
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Equity Marker Level
                        </label>
                        <div className="flex space-x-6">
                            {["strong", "medium", "weak"].map((level) => (
                                <label
                                    key={level}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name="equity_marker"
                                        value={level}
                                        checked={
                                            formData.equity_marker === level
                                        }
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                                        {level}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Equity Marker Description
                        </label>
                        <textarea
                            name="equity_marker_description"
                            value={formData.equity_marker_description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Alignment (SDG/NAP/CFF) */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Alignment (SDG/NAP/CFF)
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* SDG Selection */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                            Sustainable Development Goals (SDGs)
                        </h4>
                        <CheckboxGroup
                            label="Select SDGs"
                            options={sdgList}
                            selectedValues={formData.alignment_sdg}
                            onChange={(values) =>
                                handleMultiSelectChange(
                                    { target: { value: values } },
                                    "alignment_sdg"
                                )
                            }
                            getOptionId={(sdg) => sdg.id}
                            getOptionLabel={(sdg) =>
                                `${sdg.number}: ${sdg.title}`
                            }
                        />
                    </div>

                    {/* NAP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            National Adaptation Plans (NAP)
                        </label>
                        <textarea
                            name="alignment_nap"
                            value={formData.alignment_nap}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>

                    {/* CFF */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Climate Fiscal Frameworks (CFF)
                        </label>
                        <textarea
                            name="alignment_cff"
                            value={formData.alignment_cff}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>

            {/* Assessment */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Assessment
                </h3>
                <div className="bg-gradient-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assessment
                        </label>
                        <textarea
                            name="assessment"
                            value={formData.assessment}
                            onChange={handleInputChange}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProjectFormSections;
