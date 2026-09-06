import { useEffect, useRef, useState } from "react";
import { useAllOccasions } from "../../hooks/useCatalog";
import { useBookingStore } from "../../store/bookingStore";
import { showModal } from "../../store/modalStore";
import { getImageUrl } from "../../lib/imageUrl";
import KnowMore from "../KnowMore/KnowMore";

function OccasionsSection() {
  const { data: occasions = [] } = useAllOccasions();
  const {
    occasion: currentOccasion,
    isEditing,
    setBookingOccasion,
  } = useBookingStore();

  const [selected, setSelected] = useState(null);
  const [celebrantName, setCelebrantName] = useState("");
  const [changedOccasion, setChangedOccasion] = useState(null);
  const [isChanged, setIsChanged] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!currentOccasion || occasions.length === 0) return;

    const bookedOccasion = occasions.find(
      (occasion) =>
        occasion.price === currentOccasion.price &&
        occasion.name === currentOccasion.name,
    );

    if (!bookedOccasion && isEditing) {
      setChangedOccasion(currentOccasion);
      setSelected(currentOccasion);
    } else {
      setChangedOccasion(null);
      setSelected(currentOccasion);
    }

    if (currentOccasion.celebrantName) {
      setCelebrantName(currentOccasion.celebrantName);
    }
  }, [currentOccasion, occasions, isEditing]);

  function handleSelect(occasion) {
    if (isEditing) {
      setIsChanged(true);
    }
    if (selected?._id === occasion._id) {
      setSelected(null);
      setBookingOccasion(null);
    } else {
      const updatedOccasion = {
        ...occasion,
        celebrantName: celebrantName || "",
      };
      setSelected(updatedOccasion);
      setBookingOccasion(updatedOccasion);
      if (inputRef.current) {
        const topPosition =
          inputRef.current.getBoundingClientRect().top + window.pageYOffset;
        const scrollToPosition = topPosition - window.innerHeight * 0.7;
        window.scrollTo({
          top: scrollToPosition,
          behavior: "smooth",
        });
        inputRef.current.focus();
      }
    }
  }

  function handleCelebrantName(e) {
    setCelebrantName(e.target.value);
  }

  function handleBlur() {
    if (selected) {
      const updatedOccasion = {
        ...selected,
        celebrantName: celebrantName,
      };
      setBookingOccasion(updatedOccasion);
    }
  }

  function handleKeyPress(e) {
    if (e.key === "Enter") {
      handleBlur();
    }
  }

  function handleKnowMore({ title, info }) {
    showModal({ title, info }, KnowMore);
  }

  return (
    <section className="option-section pt-6 mt-4 border-t border-white">
      <div className="w-full">
        {occasions.length > 0 ? (
          <div className="grid w-full gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            {occasions.map((occasion, index) => {
              let isSelected = selected?._id === occasion._id;
              return (
                <div
                  className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${isSelected ? "selected" : ""}`}
                  key={index}
                  onClick={() => handleSelect(occasion)}
                >
                  <div className="p-2 rounded-lg bg-bright">
                    <div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
                      <img
                        className="absolute object-cover w-full h-full"
                        src={getImageUrl(occasion.image)}
                        alt={occasion.name}
                      />
                    </div>
                    <h5 className="text-center mt-2">{occasion.name}</h5>
                    <div className="flex justify-between mt-1 items-center">
                      <p className="font-medium text-primary text-md">
                        ₹ {occasion.price}
                      </p>
                      <div onClick={(e) => e.stopPropagation()}>
                        <button
                          className="faq-button"
                          onClick={() =>
                            handleKnowMore({
                              title: "Occasion",
                              info: occasion.description,
                            })
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                          >
                            <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
                          </svg>
                          <span className="tooltip">Know More</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {changedOccasion && (
              <div
                className={`p-[1.5px] rounded-lg cursor-pointer selected-1 ${!isChanged ? "selected" : ""}`}
                onClick={() => handleSelect(changedOccasion)}
              >
                <div className="p-2 rounded-lg bg-bright">
                  <div className="w-full aspect-[16/12] relative overflow-hidden rounded-md">
                    <img
                      className="absolute object-cover w-full h-full"
                      src={undefined}
                      alt={changedOccasion.name}
                    />
                  </div>
                  <h5 className="text-center mt-2">{changedOccasion.name}</h5>
                  <div className="flex justify-between mt-1 items-center">
                    <p className="font-medium text-primary text-md">
                      ₹ {changedOccasion.price}
                    </p>
                    <div onClick={(e) => e.stopPropagation()}>
                      <button
                        className="faq-button"
                        onClick={() =>
                          handleKnowMore({
                            title: "Occasion",
                            info: "this occasion is deleted",
                          })
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 320 512"
                        >
                          <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"></path>
                        </svg>
                        <span className="tooltip">Know More</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex items-center justify-center min-h-sm">
            <h3 className="text-gray-500 text-center">
              No Occasions Available
            </h3>
          </div>
        )}
      </div>
      <div className="w-full md:max-w-[300px] mt-5  m-auto">
        <div className="input-wrapper ">
          <label
            htmlFor="celebrantName"
            className="whitespace-nowrap font-medium"
          >
            Celebrant&apos;s Name:
          </label>
          <input
            type="text"
            placeholder="Celebrant's Name"
            ref={inputRef}
            id="celebrantName"
            name="celebrantName"
            value={celebrantName}
            onChange={handleCelebrantName}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>
    </section>
  );
}

export default OccasionsSection;
