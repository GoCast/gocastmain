#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface AbstractActionSheetPicker : NSObject
@property (nonatomic, copy) NSString *title;
@property (nonatomic, retain) UIView *pickerView;
@property (nonatomic, readonly) CGSize viewSize;
@property (nonatomic, retain) NSMutableArray *customButtons;
@property (nonatomic, assign) BOOL hideCancel;
@property (nonatomic, assign) CGRect presentFromRect;

    // For subclasses.
- (id)initWithTarget:(id)target successAction:(SEL)successAction cancelAction:(SEL)cancelActionOrNil origin:(id)origin;

    // Present the ActionSheetPicker
- (void)showActionSheetPicker;

    // For subclasses.  This is used to send a message to the target upon a successful selection and dismissal of the picker (i.e. not canceled).
- (void)notifyTarget:(id)target didSucceedWithAction:(SEL)successAction origin:(id)origin;

    // For subclasses.  This is an optional message upon cancelation of the picker.
- (void)notifyTarget:(id)target didCancelWithAction:(SEL)cancelAction origin:(id)origin;

    // For subclasses.  This returns a configured picker view.  Subclasses should autorelease.
- (UIPickerView *)configuredPickerView;

    // Adds custom buttons to the left of the UIToolbar that select specified values
- (void)addCustomButtonWithTitle:(NSString *)title value:(id)value;

    //For subclasses. This responds to a custom button being pressed.
- (IBAction)customButtonPressed:(id)sender;

@end
