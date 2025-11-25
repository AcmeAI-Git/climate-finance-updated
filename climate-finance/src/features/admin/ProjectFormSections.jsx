import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CheckboxGroup from "../../components/ui/CheckboxGroup";
import RadioWithSliders from "../../components/ui/RadioWithSliders";
import SingleSlider from "../../components/ui/SingleSlider";
import { sdgList } from "../../constants/sdgList";
import { formFieldDescriptions } from "../../constants/formFieldDescriptions";
import { useLanguage } from "../../context/LanguageContext";

const ProjectFormSections = ({
    formData,
    handleInputChange,
    handleWashComponentChange,
    agencies,
    fundingSources,
    setFormData, // Added setFormData prop
}) => {
    const navigate = useNavigate();
    const { language } = useLanguage();
    // helper to convert western digits to Bengali numerals
    const toBengaliNumeral = (num) => {
        const beng = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
        return String(num).split('').map(ch => (ch >= '0' && ch <= '9') ? beng[Number(ch)] : ch).join('');
    };
    const [districtsData, setDistrictsData] = useState({});
    const [availableDistricts, setAvailableDistricts] = useState([]);
    const [availableDivisions, setAvailableDivisions] = useState([]);

    // Load districts data
    useEffect(() => {
        fetch("/bd-districts.json")
            .then((res) => res.json())
            .then((data) => {
                setDistrictsData(data);
                // Set available divisions
                const divisions = Object.keys(data).map((name, index) => ({
                    id: index + 1,
                    name: name,
                }));
                setAvailableDivisions(divisions);
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

    // Filter districts based on selected geographic divisions (multi)
    useEffect(() => {
        // Don't run if districtsData hasn't loaded yet
        if (Object.keys(districtsData).length === 0) {
            return;
        }

        if (
            Array.isArray(formData.geographic_division) &&
            formData.geographic_division.length > 0
        ) {
            let filteredDistricts = [];
            formData.geographic_division.forEach((division) => {
                if (districtsData[division]) {
                    filteredDistricts = filteredDistricts.concat(
                        districtsData[division].map((name) => ({ name }))
                    );
                }
            });

            // Remove duplicates and add id
            const uniqueDistricts = Array.from(
                new Set(filteredDistricts.map((d) => d.name))
            ).map((name, index) => ({ id: index + 1, name }));

            setAvailableDistricts(uniqueDistricts);

            // Validate current districts against available ones
            // Only validate if we have existing districts to check
            if (
                Array.isArray(formData.districts) &&
                formData.districts.length > 0
            ) {
                const validDistrictNames = uniqueDistricts.map((d) => d.name);
                const invalidDistricts = formData.districts.filter(
                    (districtName) => !validDistrictNames.includes(districtName)
                );

                // Only update if there are invalid districts to remove
                if (invalidDistricts.length > 0) {
                    const validSelectedDistricts = formData.districts.filter(
                        (districtName) =>
                            validDistrictNames.includes(districtName)
                    );
                    // Only update if the filtered result is different from current
                    if (
                        validSelectedDistricts.length !==
                        formData.districts.length
                    ) {
                        setFormData((prev) => ({
                            ...prev,
                            districts: validSelectedDistricts,
                        }));
                    }
                }
            }
        } else {
            // Show all districts if no division selected
            const allDistricts = Object.values(districtsData)
                .flat()
                .map((name, index) => ({
                    id: index + 1,
                    name: name,
                }));
            setAvailableDistricts(allDistricts);
        }
    }, [formData.geographic_division, formData.districts, districtsData, setFormData]);

    const handleWashSliderChange = (value) => {
        handleWashComponentChange((prev) => ({
            ...prev,
            presence: value > 0 ? true : false,
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.agencies}
                </p>
                <CheckboxGroup
                    label="Select Agencies"
                    options={agencies}
                    selectedValues={formData.agencies || []}
                    onChange={(values) =>
                        setFormData((prev) => ({ ...prev, agencies: values }))
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.funding_sources}
                </p>
                <CheckboxGroup
                    label="Select Funding Sources"
                    options={fundingSources}
                    selectedValues={formData.funding_sources || []}
                    onChange={(values) =>
                        setFormData((prev) => ({ ...prev, funding_sources: values }))
                    }
                    getOptionId={(source) => source.funding_source_id}
                    getOptionLabel={(source) => source.name}
                    getOptionSubtext={(source) => `Development Partner: ${source.dev_partner}`}
                    onAddNew={handleAddFundingSource}
                    addButtonText="Add Funding Source"
                />
            </div>

            {/* Geographic Location */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Geographic Location
                </h3>
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.geographic_division}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Division <span className="text-red-500">*</span>
                        </label>
                        <CheckboxGroup
                            label="Select Divisions"
                            options={availableDivisions}
                            selectedValues={formData.geographic_division || []}
                            onChange={(values) =>
                                setFormData((prev) => ({ ...prev, geographic_division: values }))
                            }
                            getOptionId={(division) => division.name}
                            getOptionLabel={(division) => division.name}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Districts <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                            {formFieldDescriptions.districts}
                        </p>
                        <CheckboxGroup
                            label="Select Districts"
                            options={availableDistricts}
                            selectedValues={formData.districts || []}
                            onChange={(values) =>
                                setFormData((prev) => ({ ...prev, districts: values }))
                            }
                            getOptionId={(district) => district.name}
                            getOptionLabel={(district) => district.name}
                        />
                    </div>
                </div>
            </div>

            {/* Rural/Urban Segregation */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Rural/Urban Segregation
                </h3>
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.location_segregation}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <select
                            name="location_segregation"
                            value={formData.location_segregation || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select Location Segregation</option>
                            <option value="Rural">Rural</option>
                            <option value="Urban">Urban</option>
                            <option value="Both">Both</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* WASH Component - Updated */}
            <div>
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.wash_component}
                </p>
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.hotspot_vulnerability_type}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <select
                            name="hotspot_vulnerability_type"
                            value={formData.hotspot_vulnerability_type || ""}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                        >
                            <option value="">Select Hotspot/Vulnerability Type</option>
                            <option value="South-western coastal area and Sundarbans (SWM)">South-western coastal area and Sundarbans (SWM)</option>
                            <option value="South-east and eastern coastal area (SEE)">South-east and eastern coastal area (SEE)</option>
                            <option value="Chattogram Hill Tracts (CHT)">Chattogram Hill Tracts (CHT)</option>
                            <option value="Rivers, floodplains, and erosion-prone areas (FPE)">Rivers, floodplains, and erosion-prone areas (FPE)</option>
                            <option value="Haor and flash floods areas (HFF)">Haor and flash floods areas (HFF)</option>
                            <option value="Drought-prone and Barind areas (DBA)">Drought-prone and Barind areas (DBA)</option>
                            <option value="Northern, north-western region (NNW)">Northern, north-western region (NNW)</option>
                            <option value="Chalan beel and low-lying area of the north-western region (CBL)">Chalan beel and low-lying area of the north-western region (CBL)</option>
                            <option value="Char and Islands (CHI)">Char and Islands (CHI)</option>
                            <option value="Bay of Bengal and Ocean (BoB)">Bay of Bengal and Ocean (BoB)</option>
                            <option value="Urban areas (URB)">Urban areas (URB)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Beneficiaries - Updated */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Beneficiaries
                </h3>
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.direct_beneficiaries}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Direct Beneficiaries
                            </label>
                            <input
                                type="number"
                                name="direct_beneficiaries"
                                value={formData.direct_beneficiaries || ""}
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
                                value={formData.indirect_beneficiaries || ""}
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
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                            {formFieldDescriptions.beneficiary_description}
                        </p>
                        <textarea
                            name="beneficiary_description"
                            value={formData.beneficiary_description || ""}
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.gender_inclusion}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <textarea
                            name="gender_inclusion"
                            value={formData.gender_inclusion || ""}
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.equity_marker}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Equity Marker Level
                        </label>
                        <div className="flex space-x-6">
                            {['Strong', 'Partial', 'Weak'].map((level) => (
                                <label
                                    key={level}
                                    className="flex items-center"
                                >
                                    <input
                                        type="radio"
                                        name="equity_marker"
                                        value={level}
                                        checked={formData.equity_marker === level}
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
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                            {formFieldDescriptions.equity_marker_description}
                        </p>
                        <textarea
                            name="equity_marker_description"
                            value={formData.equity_marker_description || ""}
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
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm space-y-6">
                    {/* SDG Selection */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">
                            Sustainable Development Goals (SDGs)
                        </h4>
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                        {formFieldDescriptions.alignment_sdg}
                        </p>
                        <CheckboxGroup
                            label="Select SDGs"
                            options={sdgList}
                            selectedValues={formData.alignment_sdg || []}
                            onChange={(values) =>
                                setFormData((prev) => ({ ...prev, alignment_sdg: values }))
                            }
                            getOptionId={(sdg) => sdg.id}
                            getOptionLabel={(sdg) =>
                                language === 'bn'
                                    ? `${toBengaliNumeral(sdg.id)}: ${sdg.banglaTitle || sdg.title}`
                                    : `${sdg.id}: ${sdg.title}`
                            }
                        />
                    </div>

                    {/* NAP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            National Adaptation Plans (NAP)
                        </label>
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                            {formFieldDescriptions.alignment_nap}
                        </p>
                        <textarea
                            name="alignment_nap"
                            value={formData.alignment_nap || ""}
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
                        <p className="text-sm text-gray-500 mb-2 font-medium italic">
                            {formFieldDescriptions.alignment_cff}
                        </p>
                        <textarea
                            name="alignment_cff"
                            value={formData.alignment_cff || ""}
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
                <p className="text-sm text-gray-500 mb-2 font-medium italic">
                    {formFieldDescriptions.assessment}
                </p>
                <div className="bg-linear-to-br from-white to-gray-50 border-0 rounded-2xl p-6 shadow-sm">
                    <div>
                        <textarea
                            name="assessment"
                            value={formData.assessment || ""}
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
