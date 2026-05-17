import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type ProfileStackParamList = {
  Settings: undefined;
  HelpDesk: undefined;
  BlockModal: undefined;
  BasicProfileSetup: undefined;
};

// --- Sub-components for Form ---

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6">
    <Text className="text-lg font-bold text-slate-800 mb-4">{title}</Text>
    {children}
  </View>
);

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
  <View className="mb-4">
    <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</Text>
    <TextInput
      className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-800"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
    />
  </View>
);

const Selector = ({ label, options, current, setter }: { label: string; options: string[]; current: string; setter: (v: any) => void }) => (
  <View className="mb-4">
    <Text className="text-[10px] font-bold text-slate-400 uppercase mb-2">{label}</Text>
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => (
        <TouchableOpacity
          key={opt}
          onPress={() => setter(opt)}
          className={`px-4 py-2 rounded-full border ${current === opt ? 'bg-primary border-primary' : 'bg-white border-slate-200'}`}
        >
          <Text className={`text-[10px] font-semibold ${current === opt ? 'text-white' : 'text-slate-600'}`}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export const BasicProfileSetup = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  // --- 1. Personal Information ---
  const [personal, setPersonal] = useState({
    gender: 'Male',
    fullName: '',
    age: '',
    height: '',
    weight: '',
    complexion: '',
    maritalStatus: 'Single',
    disability: '',
    languages: '',
    whatsapp: '',
    nriStatus: 'Living in Pakistan',
  });

  // --- 2. Education (Repeatable) ---
  const [education, setEducation] = useState([{
    school: '', university: '', field: '', degree: '', status: 'Complete', year: ''
  }]);

  // --- 3. Occupation & Income ---
  const [occupation, setOccupation] = useState({
    type: 'Job',
    title: '',
    company: '',
    incomeSource: 'Job',
    workingAbroad: 'No',
    abroadCountry: '',
    salary: 'Range',
    futurePlans: ''
  });

  // --- 4. Religion & Background ---
  const [religion, setReligion] = useState({
    religion: 'Islam',
    maslak: '',
    caste: '',
    subCaste: '',
    origin: 'Local'
  });

  // --- 5. Property (Repeatable) ---
  const [properties, setProperties] = useState([{
    status: 'Owned', type: 'House', size: '', location: '', other: ''
  }]);

  // --- 6. Family Details ---
  const [family, setFamily] = useState({
    fatherName: '', fatherStatus: 'Living', fatherProfession: '',
    motherStatus: 'Living', motherProfession: '',
    totalSiblings: '', brothers: '', marriedBrothers: '', sisters: '', marriedSisters: '',
    anyFamilyAbroad: 'No', abroadDetails: '', socialStatus: 'Middle Class', children: 'None'
  });

  // --- 7. Address & Residence ---
  const [address, setAddress] = useState({
    country: 'Pakistan', city: '', sector: '', homeTown: '', tehsil: '', dualResidence: ''
  });

  const addEducation = () => setEducation([...education, { school: '', university: '', field: '', degree: '', status: 'Complete', year: '' }]);
  const addProperty = () => setProperties([...properties, { status: 'Owned', type: 'House', size: '', location: '', other: '' }]);

  const handleSubmit = () => {
    const fullProfile = { personal, education, occupation, religion, properties, family, address };
    console.log('SUBMITTING FULL PROFILE:', JSON.stringify(fullProfile, null, 2));
    navigation.goBack();
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="p-6">
        <View className="mb-8 mt-4 flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-slate-800">Complete Your Profile</Text>
            <Text className="text-slate-500">Provide accurate details to find your perfect match.</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-slate-200 px-3 py-1 rounded-full"
          >
            <Text className="text-[10px] font-bold text-slate-600">SKIP FOR NOW</Text>
          </TouchableOpacity>
        </View>

        {/* 1. Personal Information */}
        <Section title="Personal Information">
          <Selector label="Gender" options={['Male', 'Female']} current={personal.gender} setter={(v) => setPersonal({...personal, gender: v})} />
          <InputField label="Full Name" value={personal.fullName} onChangeText={(v:any) => setPersonal({...personal, fullName: v})} placeholder="Muhammad Ali" />
          <View className="flex-row justify-between">
            <View className="w-[48%]"><InputField label="Age / DOB" value={personal.age} onChangeText={(v:any) => setPersonal({...personal, age: v})} placeholder="25" /></View>
            <View className="w-[48%]"><InputField label="Height" value={personal.height} onChangeText={(v:any) => setPersonal({...personal, height: v})} placeholder={`5'10"`} /></View>
          </View>
          <View className="flex-row justify-between">
            <View className="w-[48%]"><InputField label="Weight (Kg/Lbs)" value={personal.weight} onChangeText={(v:any) => setPersonal({...personal, weight: v})} placeholder="70 Kg" /></View>
            <View className="w-[48%]"><InputField label="Complexion" value={personal.complexion} onChangeText={(v:any) => setPersonal({...personal, complexion: v})} placeholder="Fair" /></View>
          </View>
          <Selector label="Marital Status" options={['Single', 'Divorced', 'Widowed', 'Separated']} current={personal.maritalStatus} setter={(v) => setPersonal({...personal, maritalStatus: v})} />
          <InputField label="Physical Disability / Health Condition" value={personal.disability} onChangeText={(v:any) => setPersonal({...personal, disability: v})} placeholder="None" />
          <InputField label="Languages Spoken" value={personal.languages} onChangeText={(v:any) => setPersonal({...personal, languages: v})} placeholder="Urdu, English, Punjabi" />
          <InputField label="WhatsApp / Phone Number" value={personal.whatsapp} onChangeText={(v:any) => setPersonal({...personal, whatsapp: v})} placeholder="+92 3xx xxxxxxx" keyboardType="phone-pad" />
          <Selector label="NRI / Abroad Status" options={['Living in Pakistan', 'Abroad', 'PR Applied']} current={personal.nriStatus} setter={(v) => setPersonal({...personal, nriStatus: v})} />
        </Section>

        {/* 2. Education Details */}
        <Section title="Education Details">
          {education.map((edu, index) => (
            <View key={index} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <InputField label="School Name" value={edu.school} onChangeText={(v:any) => {
                const newEdu = [...education]; newEdu[index].school = v; setEducation(newEdu);
              }} placeholder="School Name" />
              <InputField label="College / University" value={edu.university} onChangeText={(v:any) => {
                const newEdu = [...education]; newEdu[index].university = v; setEducation(newEdu);
              }} placeholder="University Name" />
              <InputField label="Field of Study" value={edu.field} onChangeText={(v:any) => {
                const newEdu = [...education]; newEdu[index].field = v; setEducation(newEdu);
              }} placeholder="e.g. Computer Science" />
              <View className="flex-row justify-between">
                <View className="w-[48%]"><InputField label="Degree Name" value={edu.degree} onChangeText={(v:any) => {
                  const newEdu = [...education]; newEdu[index].degree = v; setEducation(newEdu);
                }} placeholder="BSCS" /></View>
                <View className="w-[48%]"><InputField label="Graduation Year" value={edu.year} onChangeText={(v:any) => {
                  const newEdu = [...education]; newEdu[index].year = v; setEducation(newEdu);
                }} placeholder="2022" /></View>
              </View>
              <Selector label="Status" options={['Ongoing', 'Complete']} current={edu.status} setter={(v) => {
                const newEdu = [...education]; newEdu[index].status = v; setEducation(newEdu);
              }} />
            </View>
          ))}
          <TouchableOpacity onPress={addEducation} className="bg-primary/10 py-3 rounded-xl items-center border border-primary/20">
            <Text className="text-primary font-bold">+ Add Education</Text>
          </TouchableOpacity>
        </Section>

        {/* 3. Occupation & Income */}
        <Section title="Occupation & Income">
          <Selector label="Employment Type" options={['Business', 'Job', 'Student', 'Retired']} current={occupation.type} setter={(v) => setOccupation({...occupation, type: v})} />
          <InputField label="Job Title / Position" value={occupation.title} onChangeText={(v:any) => setOccupation({...occupation, title: v})} placeholder="Senior Engineer" />
          <InputField label="Company / Business Name" value={occupation.company} onChangeText={(v:any) => setOccupation({...occupation, company: v})} placeholder="Company Name" />
          <Selector label="Income Source" options={['Job', 'Business', 'Family Business', 'Investments']} current={occupation.incomeSource} setter={(v) => setOccupation({...occupation, incomeSource: v})} />
          <Selector label="Working Abroad" options={['Yes', 'No']} current={occupation.workingAbroad} setter={(v) => setOccupation({...occupation, workingAbroad: v})} />
          {occupation.workingAbroad === 'Yes' && <InputField label="Country" value={occupation.abroadCountry} onChangeText={(v:any) => setOccupation({...occupation, abroadCountry: v})} placeholder="e.g. UAE" />}
          <InputField label="Monthly Income / Range" value={occupation.salary} onChangeText={(v:any) => setOccupation({...occupation, salary: v})} placeholder="e.g. 150k - 200k" />
          <InputField label="Future Career Plans" value={occupation.futurePlans} onChangeText={(v:any) => setOccupation({...occupation, futurePlans: v})} placeholder="Plans for next 5 years..." />
        </Section>

        {/* 4. Religion & Background */}
        <Section title="Religion & Background">
          <InputField label="Religion" value={religion.religion} onChangeText={(v:any) => setReligion({...religion, religion: v})} placeholder="Islam" />
          <InputField label="Maslak / Sect" value={religion.maslak} onChangeText={(v:any) => setReligion({...religion, maslak: v})} placeholder="Sunni / Shia / etc" />
          <View className="flex-row justify-between">
            <View className="w-[48%]"><InputField label="Caste" value={religion.caste} onChangeText={(v:any) => setReligion({...religion, caste: v})} placeholder="Caste" /></View>
            <View className="w-[48%]"><InputField label="Sub-Caste / Clan" value={religion.subCaste} onChangeText={(v:any) => setReligion({...religion, subCaste: v})} placeholder="Clan" /></View>
          </View>
          <Selector label="Family Origin" options={['Local', 'Migrated']} current={religion.origin} setter={(v) => setReligion({...religion, origin: v})} />
        </Section>

        {/* 5. Property Details */}
        <Section title="Property Details">
          {properties.map((prop, index) => (
            <View key={index} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Selector label="Ownership Status" options={['Owned', 'Rented']} current={prop.status} setter={(v) => {
                const newProps = [...properties]; newProps[index].status = v; setProperties(newProps);
              }} />
              <Selector label="Property Type" options={['House', 'Plot', 'Apartment', 'Commercial']} current={prop.type} setter={(v) => {
                const newProps = [...properties]; newProps[index].type = v; setProperties(newProps);
              }} />
              <InputField label="Size (e.g. 10 Marla)" value={prop.size} onChangeText={(v:any) => {
                const newProps = [...properties]; newProps[index].size = v; setProperties(newProps);
              }} placeholder="1 Kanal" />
              <InputField label="Location / Area" value={prop.location} onChangeText={(v:any) => {
                const newProps = [...properties]; newProps[index].location = v; setProperties(newProps);
              }} placeholder="DHA Phase 6" />
            </View>
          ))}
          <TouchableOpacity onPress={addProperty} className="bg-primary/10 py-3 rounded-xl items-center border border-primary/20">
            <Text className="text-primary font-bold">+ Add Property</Text>
          </TouchableOpacity>
        </Section>

        {/* 6. Family Details */}
        <Section title="Family Details">
          <InputField label="Father's Name" value={family.fatherName} onChangeText={(v:any) => setFamily({...family, fatherName: v})} placeholder="Father's Name" />
          <Selector label="Father's Status" options={['Living', 'Late', 'Deceased']} current={family.fatherStatus} setter={(v) => setFamily({...family, fatherStatus: v})} />
          <InputField label="Father's Profession" value={family.fatherProfession} onChangeText={(v:any) => setFamily({...family, fatherProfession: v})} placeholder="Profession" />
          <Selector label="Mother's Status" options={['Living', 'Housewife', 'Retired', 'Late']} current={family.motherStatus} setter={(v) => setFamily({...family, motherStatus: v})} />
          <InputField label="Mother's Profession" value={family.motherProfession} onChangeText={(v:any) => setFamily({...family, motherProfession: v})} placeholder="Profession" />
          
          <View className="flex-row flex-wrap justify-between">
            <View className="w-[48%]"><InputField label="Total Siblings" value={family.totalSiblings} onChangeText={(v:any) => setFamily({...family, totalSiblings: v})} placeholder="0" keyboardType="numeric" /></View>
            <View className="w-[48%]"><InputField label="Brothers" value={family.brothers} onChangeText={(v:any) => setFamily({...family, brothers: v})} placeholder="0" keyboardType="numeric" /></View>
            <View className="w-[48%]"><InputField label="Married Brothers" value={family.marriedBrothers} onChangeText={(v:any) => setFamily({...family, marriedBrothers: v})} placeholder="0" keyboardType="numeric" /></View>
            <View className="w-[48%]"><InputField label="Sisters" value={family.sisters} onChangeText={(v:any) => setFamily({...family, sisters: v})} placeholder="0" keyboardType="numeric" /></View>
            <View className="w-[48%]"><InputField label="Married Sisters" value={family.marriedSisters} onChangeText={(v:any) => setFamily({...family, marriedSisters: v})} placeholder="0" keyboardType="numeric" /></View>
          </View>

          <Selector label="Any Family Member Abroad" options={['Yes', 'No']} current={family.anyFamilyAbroad} setter={(v) => setFamily({...family, anyFamilyAbroad: v})} />
          {family.anyFamilyAbroad === 'Yes' && <InputField label="Abroad Details" value={family.abroadDetails} onChangeText={(v:any) => setFamily({...family, abroadDetails: v})} placeholder="Country & Relation" />}
          
          <Selector label="Social Status" options={['Elite', 'Upper Middle', 'Middle Class', 'Lower Middle']} current={family.socialStatus} setter={(v) => setFamily({...family, socialStatus: v})} />
          <InputField label="Children (if any)" value={family.children} onChangeText={(v:any) => setFamily({...family, children: v})} placeholder="Number and Ages" />
        </Section>

        {/* 7. Address & Residence */}
        <Section title="Address & Residence">
          <InputField label="Current Country" value={address.country} onChangeText={(v:any) => setAddress({...address, country: v})} placeholder="Pakistan" />
          <InputField label="Current City" value={address.city} onChangeText={(v:any) => setAddress({...address, city: v})} placeholder="Islamabad" />
          <InputField label="Sector / Area" value={address.sector} onChangeText={(v:any) => setAddress({...address, sector: v})} placeholder="E-11" />
          <InputField label="Home Town" value={address.homeTown} onChangeText={(v:any) => setAddress({...address, homeTown: v})} placeholder="Sialkot" />
          <InputField label="Tehsil & District" value={address.tehsil} onChangeText={(v:any) => setAddress({...address, tehsil: v})} placeholder="Tehsil, District" />
          <InputField label="Dual Residence Details" value={address.dualResidence} onChangeText={(v:any) => setAddress({...address, dualResidence: v})} placeholder="Other cities/countries" />
        </Section>

        <TouchableOpacity 
          onPress={handleSubmit}
          className="bg-primary py-4 rounded-3xl items-center shadow-lg shadow-primary/30 mb-12"
        >
          <Text className="text-white font-bold text-lg">Save & Continue to Twin Setup</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
